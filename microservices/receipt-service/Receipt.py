from enum import Enum
from typing import List
from dateutil import parser, utils
from dateutil.parser import ParserError
from price_parser import Price
from dateutil.tz import gettz
import json


class ReceiptError(Exception):
    """To format an error message to reply to LLM"""
    def __init__(self, field_name_with_error: str, error_msg: str):
        self.field_name = field_name_with_error
        self.error_msg = error_msg
        super().__init__(f"Input error for field: {self.field_name}. {self.error_msg}")

class APIKeyError(Exception):
    """Invalid API key"""
    def __init__(self):
        # No message needed
        super().__init__()


class Category(Enum):
    TRANSPORT = 'Transport'
    CLOTHING = 'Clothing'
    HEALTHCARE = 'Healthcare'
    FOOD = 'Food'
    LEISURE = 'Leisure'
    HOUSING = 'Housing'
    OTHERS = 'Others'
    INVALID = 'Invalid' # Only used if the image is not a receipt

    @classmethod
    def validate_category(cls, value):
        try:
            category = cls(value)
            if category == cls.INVALID:
                raise ReceiptError("category", f"Invalid category should only be used when the image is not a receipt")
            return category
        except ValueError:
            raise ReceiptError("category", f"Invalid category '{value}'. The valid categories are: {', '.join([cat.value for cat in cls if cat != cls.INVALID])}")


class Item:
    def __init__(self, item_name: str, item_cost: str, item_quantity: int):
        self.item_name = item_name
        self.item_cost = item_cost
        self.item_quantity = item_quantity

    def __repr__(self):
        return f"Item(item_name={self.item_name}, item_quantity={self.item_quantity}, item_cost={self.item_cost})"

    def to_dict(self):
        return {
            "item_name": self.item_name,
            "item_cost": self.item_cost,
            "item_quantity": self.item_quantity,
        }


class Receipt:
    def __init__(self, merchant_name: str, date: str, total_cost: str, category: Category, itemized_list: List[Item]):
        self.merchant_name = merchant_name
        self._date = self.parse_date(date)
        self._total_cost = self.parse_total_cost(total_cost)
        self._category = Category.validate_category(category)
        self._itemized_list = self.parse_itemized_list(itemized_list)

        # Additional validation
        self.validate_non_empty()

    def to_dict(self):
        return {
            "merchant_name": self.merchant_name,
            "date": self.date,
            "total_cost": self.total_cost,
            "category": self.category,
            "itemized_list": [item.to_dict() for item in self.itemized_list]
        }

    @property
    def date(self) -> str:
        return self._date.strftime("%d/%m/%Y")

    @property
    def category(self) -> str:
        return str(self._category.name)

    @property
    def total_cost(self) -> str:
        return str(self._total_cost.amount)

    @property
    def itemized_list(self) -> List[Item]:
        return [Item(item['item_name'], str(item['item_cost'].amount), item.get('item_quantity', 1)) for item in self._itemized_list]
#
    @staticmethod
    def parse_date(date_string: str):
        if date_string == "None":
            # Date cannot be found in the receipt, use today's date
            return utils.today(tzinfo=gettz("Asia/Singapore")).date()
        try:
            return parser.parse(date_string, dayfirst=True, tzinfos={"SGT": gettz("Asia/Singapore")})
        except ParserError:
            raise ReceiptError("date", f"Invalid date format: '{date_string}'. If possible, provide a valid date in the format: 'YYYY-MM-DD'")

    @staticmethod
    def parse_total_cost(total_cost: str):
        price_obj = Price.fromstring(total_cost)

        if price_obj.amount is None:
            raise ReceiptError("total_cost", f"Invalid total cost '{total_cost}'. Please provide a valid number")

        return price_obj

    @staticmethod
    def parse_itemized_list(itemized_list: List[Item]):
        # Loop each item and parse the cost
        for item_dict in itemized_list:
            item_dict['item_cost'] = Receipt.parse_total_cost(item_dict['item_cost'])

        return itemized_list

    def validate_non_empty(self):
        for attr, value in self.__dict__.items():
            if isinstance(value, str):
                temp = value.strip()
            if isinstance(value, list):
                for item in value:
                    if isinstance(item, str):
                        temp = item.strip()
            else:
                temp = value

            if not temp:
                raise ReceiptError(attr, f"Field '{attr}' cannot be empty")

    def __repr__(self):
        return (f"Receipt(merchant_name={self.merchant_name}, date={self.date}, total_cost={self.total_cost}, "
                f"category={self.category}, itemized_list={self.itemized_list})")


class ReceiptEncoder(json.JSONEncoder):
    def default(self, obj):
        # Call to_dict for custom types
        if isinstance(obj, Receipt):
            return obj.to_dict()
        elif isinstance(obj, Item):
            return obj.to_dict()
        elif isinstance(obj, Enum):
            return obj.value
        return super().default(obj)