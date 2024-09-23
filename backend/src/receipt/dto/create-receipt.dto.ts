import {
  IsNotEmpty,
  IsArray,
  IsNumber,
  ValidateNested,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../receipt.enums';
import { Type } from 'class-transformer';

class ItemDto {
  @ApiProperty({ description: 'Name of the item', example: 'Item 1' })
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({ description: 'Quantity of the item', example: 2 })
  @IsNotEmpty()
  @IsNumber()
  itemQuantity: number;

  @ApiProperty({ description: 'Cost of the item', example: '10.00' })
  @IsNotEmpty()
  itemCost: number;
}

export class CreateReceiptDto {
  @ApiProperty({ description: 'Merchant name', example: 'KFC' })
  @IsNotEmpty()
  merchantName: string;

  @ApiProperty({ description: 'Date of the receipt', example: '2024-09-01' })
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Total cost', example: '19.99' })
  @IsNotEmpty()
  totalCost: number;

  @ApiProperty({ description: 'Category of the receipt', example: 'Food' })
  @IsNotEmpty()
  category: Category;

  @ApiProperty({
    description: 'Itemized list of purchased items',
    type: [ItemDto],
  })
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  @IsArray()
  itemizedList: ItemDto[];

  @ApiProperty({
    description: 'Base64 encoded receipt image string',
    example: 'data:image/png;base64,iVBORw0KGgo...',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string; // Expect base64 string
}
