from enum import Enum
from typing import List


class ReceiptError(Exception):
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
    def __init__(self, shop_name: str, date: str, total_cost: str, category: Category, itemized_list: List[Item]):
        self.shop_name = shop_name
        self.date = date
        self.total_cost = total_cost
        self.category = Category.validate_category(category)
        self.itemized_list = itemized_list

    def validate_input(self):
        self.validate_non_empty()
        # Can add more validation if needed

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