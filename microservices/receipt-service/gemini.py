import google.generativeai as genai
import PIL.Image
from werkzeug.datastructures import FileStorage
import typing_extensions
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import json
from Receipt import Receipt, ReceiptError, Category

# Define the template of the return json obj
# Method 1
# Does not seem to work well, inconsistent results
# class LineItemSchema(typing_extensions.TypedDict):
#     item_name: str
#     item_quantity: int
#     item_cost: str
#
# class ReceiptResponseSchema(typing_extensions.TypedDict):
#     merchant_name: str
#     total_cost: str
#     category: str
#     date: str
#     itemized_list: list[LineItemSchema]

# Method 2
receipt_schema = genai.protos.Schema(
    type=genai.protos.Type.OBJECT,
    properties={
        'merchant_name': genai.protos.Schema(type=genai.protos.Type.STRING),
        'date': genai.protos.Schema(type=genai.protos.Type.STRING),
        'total_cost': genai.protos.Schema(type=genai.protos.Type.STRING),
        'category': genai.protos.Schema(
            type=genai.protos.Type.STRING,
            enum=Category.__members__.keys()
        ),
        'itemized_list': genai.protos.Schema(
            type=genai.protos.Type.ARRAY,
            items=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    'item_name': genai.protos.Schema(type=genai.protos.Type.STRING),
                    'item_cost': genai.protos.Schema(type=genai.protos.Type.STRING),
                    'item_quantity': genai.protos.Schema(type=genai.protos.Type.NUMBER),
                }
            )
        )
    },
    required=['merchant_name', 'date', 'total_cost', 'category', 'itemized_list']
)


class GeminiReceiptParser:
        def __init__(self, api_key: str, model_version: str = 'models/gemini-1.5-flash'):
                # Configure the API key
                genai.configure(api_key=api_key)
                # Setup model config
                self.system_instruction = """You are an AI language model tasked with extracting key information from a receipt.
If the image given is not a receipt, please return Invalid category and ignore all other fields."""

                # Init chat instance
                self.chat_instance = self.model.start_chat(history=[], enable_automatic_function_calling=False)
                self.response = None
                self.max_retry = 3
                self.buffer = 512

                # Generation config
                self.generation_config = genai.types.GenerationConfig(
                        candidate_count=1, # Only need 1 candidate
                        stop_sequences=None, # Dont need to control model to stop
                        max_output_tokens=self.buffer, # max number of tokens to generate, should be same as buffer
                        temperature=0.1, # Low temperature to because OCR is deterministic task
                        top_p=0.1, # Low top_p to because OCR is deterministic task
                        top_k=1, # Greedy decoding because OCR is deterministic task
                        response_mime_type="application/json", # Output in json
                        response_schema=receipt_schema, # Also follow json schema
                )
                # Turn off safety settings to ensure explicit shop names or line items can be parsed
                self.safety_settings = {
                        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                }

                # Init the model
                self.model = genai.GenerativeModel(model_name=model_version, system_instruction=self.system_instruction,
                                                   generation_config=self.generation_config, safety_settings=self.safety_settings)
                self.model_info = genai.get_model(model_version)

        def get_token_count(self, prompt):
                return int(self.model.count_tokens(prompt).total_tokens)

        def parse(self, img_obj: FileStorage):
                # Define prompt
                prompt = """Given an image of a receipt, extract information from the receipt. If the image is not a receipt, please return Invalid category and ignore all other fields.

merchant_name: The name of the merchant
total_cost: The total cost of the receipt
category: The category of spending (Transport, Clothing, Healthcare, Food, Leisure, Housing, Others, Invalid). Only return Invalid if the image is not a receipt.
date: The date of the receipt
itemized_list: A list of line items, each containing:
    item_name: The name of the item
    item_cost: The cost of the item
    item_quantity: The quantity of the item
""".strip()
                # Load the image
                receipt_image = PIL.Image.open(img_obj)

                # Generate the receipt
                self.response = self.chat_instance.send_message([prompt, receipt_image],
                                                           generation_config=self.generation_config,
                                                           safety_settings=self.safety_settings)

                for attempt_num in range(self.max_retry):
                    # Attempt to parse the receipt
                    try:
                        receipt_dict = json.loads(self.response.text)

                        # If model returns None for all fields, return None
                        if receipt_dict['category'] == Category.INVALID.name:
                            print("Image is not a receipt.")
                            return None

                        receipt_instance = Receipt(**receipt_dict)
                        print(f"Attempt {attempt_num + 1} Success")

                        return receipt_instance
                    except ReceiptError as e:
                        print(f"Attempt {attempt_num + 1} Error: {e}")

                        # If max retry reached or token limit reached, return None
                        if (attempt_num + 1 == self.max_retry or
                                self.response.usage_metadata.total_token_count +
                                self.get_token_count(str(e)) + self.buffer >
                                self.model_info.input_token_limit):
                            print("Max retry reached. Unable to parse receipt.")
                            return None

                        # Continue the conversation, highlighting the error
                        self.response = self.chat_instance.send_message([str(e)],
                                                                        generation_config=self.generation_config,
                                                                        safety_settings=self.safety_settings)

                return receipt_instance
