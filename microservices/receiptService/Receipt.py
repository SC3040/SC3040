from enum import Enum
from typing import List
from dateutil import parser
from price_parser import Price


class ReceiptError(Exception):
    """To format an error message to reply to LLM"""
    def __init__(self, field_name_with_error: str, error_msg: str):
        self.field_name = field_name_with_error
        self.error_msg = error_msg
        super().__init__(f"Input error for field: {self.field_name}. {self.error_msg}")


class Category(Enum):
    TRANSPORT = 'Transport'
    CLOTHING = 'Clothing'
    HEALTHCARE = 'Healthcare'
    FOOD = 'Food'
    LEISURE = 'Leisure'
    HOUSING = 'Housing'
    OTHERS = 'Others'

    @classmethod
    def validate_category(cls, value):
        try:
            return cls(value)
        except ValueError:
            raise ReceiptError("category", f"Invalid category '{value}'. The valid categories are: {', '.join([cat.value for cat in cls])}")

class Item:
    def __init__(self, item_name: str, item_quantity: float, item_cost: str):
        self.item_name = item_name
        self.item_quantity = item_quantity
        self.item_cost = item_cost

    def __repr__(self):
        return f"Item(item_name={self.item_name}, item_quantity={self.item_quantity}, item_cost={self.item_cost})"


class Receipt:
    def __init__(self, merchant_name: str, date: str, total_cost: str, category: Category, itemized_list: List[Item]):
        self.merchant_name = merchant_name
        self._date = self.parse_date(date)
        self._total_cost = self.parse_total_cost(total_cost)
        self._category = Category.validate_category(category)
        self._itemized_list = self.parse_itemized_list(itemized_list)

        # Additional validation
        self.validate_non_empty()

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
        return [Item(item['item_name'], item['item_quantity'], str(item['item_cost'].amount)) for item in self._itemized_list]

    @staticmethod
    def parse_date(date_string: str):
        try:
            return parser.parse(date_string)
        except ValueError:
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