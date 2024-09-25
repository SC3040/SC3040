from openai import OpenAI
from pydantic import BaseModel
from typing import Optional
from Receipt import Receipt, ReceiptError, Category, APIKeyError
import json
import tiktoken
import base64
from io import BytesIO
from openai import AuthenticationError

# Response schema
class LineItemSchema(BaseModel):
    item_name: str
    item_quantity: str
    item_cost: str

class ReceiptResponseSchema(BaseModel):
    merchant_name: str
    total_cost: str
    category: Category
    date: str
    itemized_list: Optional[list[LineItemSchema]]


class OpenAIReceiptParser:
    def __init__(self, api_key, model_version: str = 'gpt-4o-mini'):
        self.client = OpenAI(api_key=api_key, max_retries=2, timeout=60.0)
        self.model_version = model_version
        self.system_instruction = """You are an AI language model tasked with extracting key information from a receipt.
If the image given is not a receipt, please return Invalid category and ignore all other fields. If the values are not present, please return 'None' for them."""

        # Chat session specific attributes
        self.messages = []
        self.max_retry = 3+1 # 3 retries, 1 initial attempt
        self.buffer = 2048 # Should be same as max_tokens output

        # Generation config
        self.generation_config = {
            'n': 1,  # number of candidates to generate, only need 1
            'max_tokens': self.buffer, # max number of tokens to generate
            'temperature': 0.1, # Low temperature to because OCR is deterministic
            'top_p': 0.1, # Low top_p to because OCR is deterministic
            'response_format': ReceiptResponseSchema, # Define the schema of the response
        }

    def parse(self, img_list):
        # Define prompt
        prompt = """Given an image of a receipt, extract information from the receipt. If the image is not a receipt, please return Invalid category and ignore all other fields.
If the values are not present, please return 'None' for them.

merchant_name: The name of the merchant
total_cost: The total cost of the receipt
category: The category of spending (Transport, Clothing, Healthcare, Food, Leisure, Housing, Others, Invalid). Only return Invalid if the image is not a receipt.
date: The date of the receipt
itemized_list: A list of line items, each containing:
    item_name: The name of the item
    item_cost: The cost of the item
    item_quantity: The quantity of the item
""".strip()

        # Convert to base64 first
        img_b64_list = []
        for img in img_list:
            img_b64_list.append(self.encode_img(img))

        # Add system instruction
        self.append_message("system", self.system_instruction)
        # Combine user prompt and image
        combined_prompt = [
            {"type": "text", "text": prompt},
            *[{"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}", "detail": "high"}} for img_b64 in img_b64_list]
        ]
        # Add user request and image
        self.append_message("user", combined_prompt)

        for attempt_num in range(self.max_retry):
            # Send the request
            # Create API request with local image
            try:
                response = self.client.beta.chat.completions.parse(
                    model=self.model_version,
                    messages=self.messages,
                    **self.generation_config
                )
            except AuthenticationError:
                raise APIKeyError()

            # Append response to messages
            response_content = response.choices[0].message.content
            self.append_message("assistant", response_content)

            try:
                # Parse json response
                receipt_dict = json.loads(response_content)

                # If model returns invalid category, return None
                if receipt_dict['category'] == Category.INVALID.value:
                    print("Image is not a receipt.")
                    return None

                receipt_instance = Receipt(**receipt_dict)
                print(f"Attempt {attempt_num + 1} Success")
                return receipt_instance
            except ReceiptError as e:
                print(f"Attempt {attempt_num + 1} Error: {e}")

                # If max retry reached or token limit reached, return None
                if (attempt_num + 1 == self.max_retry or
                        response.usage.total_tokens + self.get_token_count(str(e)) +
                        self.buffer > self.get_token_limit(self.model_version)):
                    print("Max retry reached. Unable to parse receipt.")
                    return None

                # Continue the conversation, highlighting the error
                self.append_message("user", str(e))

        return receipt_dict

    @staticmethod
    def get_token_limit(model_version: str) -> int:
        # Only include vision models
        mapper_dict = {
            'gpt-4o-mini': 128000,
            'gpt-4o': 128000,
            'gpt-4-turbo': 128000,
        }
        return mapper_dict[model_version]

    @staticmethod
    def get_token_count(prompt: str, model_version: str = 'gpt-4o-mini') -> int:
        encoding = tiktoken.encoding_for_model(model_version)
        num_tokens = len(encoding.encode(prompt))
        return num_tokens

    def append_message(self, role, content):
        if role not in ["user", "system", "assistant"]:
            raise ValueError("Role must be one of 'user', 'system', or 'assistant'")

        self.messages.append({"role": role, "content": content})

    @staticmethod
    def encode_img(img):
        buffer = BytesIO()
        img.save(buffer, format="JPEG")
        buffer.seek(0)
        image_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return image_b64
