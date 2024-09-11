import { ApiProperty } from '@nestjs/swagger';

class ItemDto {
  @ApiProperty({ description: 'Name of the item', example: 'Item 1' })
  itemName: string;

  @ApiProperty({ description: 'Quantity of the item', example: 2 })
  itemQuantity: number;

  @ApiProperty({ description: 'Cost of the item', example: '10.00' })
  itemCost: string;
}

export class ReceiptResponseDto {
  @ApiProperty({ description: 'Merchant name', example: 'KFC' })
  merchantName: string;

  @ApiProperty({ description: 'Date of the receipt', example: '2024-09-01' })
  date: string;

  @ApiProperty({ description: 'Total cost', example: '19.99' })
  totalCost: string;

  @ApiProperty({ description: 'Category of the receipt', example: 'Food' })
  category: string;

  @ApiProperty({
    description: 'Itemized list of purchased items',
    type: [ItemDto],
  })
  itemizedList: ItemDto[];

  @ApiProperty({
    description: 'Receipt image in Base64 encoding',
  })
  image: string;
}
