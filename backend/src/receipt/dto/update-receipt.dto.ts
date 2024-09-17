import {
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../receipt.enums';
import { Type } from 'class-transformer';
import { Express } from 'express';

class ItemDto {
  @ApiProperty({ description: 'Name of the item', example: 'Item 1' })
  @IsNotEmpty()
  @IsString()
  itemName: string;

  @ApiProperty({ description: 'Quantity of the item', example: 2 })
  @IsNotEmpty()
  @IsNumber()
  itemQuantity: number;

  @ApiProperty({ description: 'Cost of the item', example: '10.00' })
  @IsNotEmpty()
  itemCost: string;
}

export class UpdateReceiptDto {
  @ApiProperty({ description: 'Merchant name', example: 'KFC' })
  @IsNotEmpty()
  merchantName: string;

  @ApiProperty({ description: 'Date of the receipt', example: '2024-09-01' })
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Total cost', example: '19.99' })
  @IsNotEmpty()
  totalCost: string;

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
    description: 'Receipt image to be uploaded as binary',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  image?: Express.Multer.File;
}