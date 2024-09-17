import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReceiptEntity } from './receipt.entity';
import { CreateReceiptDto, UpdateReceiptDto, ReceiptResponseDto } from './dto';
import { plainToInstance } from 'class-transformer';
import * as path from 'path';
import * as FormData from 'form-data';
import { Binary, ObjectId } from 'mongodb';
import axios from 'axios';
import * as fs from 'node:fs';

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);

  // For manual input of cost, without using image upload
  private defaultImagePath = path.join(
    __dirname,
    '..',
    '..',
    'public',
    'images',
    'default-receipt-image.png',
  );

  constructor(
    @InjectRepository(ReceiptEntity)
    private readonly receiptRepository: Repository<ReceiptEntity>,
  ) {}

  // Stage 1: Process receipt image and return data without saving
  async processReceipt(
    image: Express.Multer.File,
  ): Promise<ReceiptResponseDto> {
    if (!image) {
      throw new HttpException('No image uploaded', HttpStatus.BAD_REQUEST);
    }

    // Send the image directly to Flask for processing (no need for Binary conversion)
    const flaskResponse = await this.processReceiptWithFlask(image);
    this.logger.log('Flask Response:', JSON.stringify(flaskResponse));

    // Map Flask response fields to internal naming convention
    return plainToInstance(ReceiptResponseDto, {
      merchantName: flaskResponse.merchant_name,
      date: flaskResponse.date,
      totalCost: flaskResponse.total_cost,
      category: flaskResponse.category,
      itemizedList: flaskResponse.itemized_list
        ? flaskResponse.itemized_list.map((item) => ({
            itemName: item.item_name,
            itemQuantity: item.item_quantity,
            itemCost: item.item_cost,
          }))
        : [], // Fallback to empty array if itemized_list is missing
      image: image.buffer.toString('base64'),
    });
  }

  // Stage 2: Create a new receipt for the user
  async createReceipt(
    userId: string,
    createReceiptDto: CreateReceiptDto,
  ): Promise<ReceiptResponseDto> {
    let binaryImage: Binary;

    if (createReceiptDto.image) {
      binaryImage = new Binary(Buffer.from(createReceiptDto.image.buffer));
    } else {
      const defaultImage = fs.readFileSync(this.defaultImagePath);
      binaryImage = new Binary(defaultImage);
    }

    // Map the DTO to the entity and store it in the database
    const receiptEntity = plainToInstance(ReceiptEntity, {
      ...createReceiptDto,
      image: binaryImage,
      userId: new ObjectId(userId),
    });

    const savedReceipt = await this.receiptRepository.save(receiptEntity);
    return this.buildReceiptResponse(savedReceipt);
  }

  // Update an existing receipt
  async updateReceipt(
    userId: string,
    receiptId: string,
    updateReceiptDto: UpdateReceiptDto,
  ): Promise<ReceiptResponseDto> {
    const receipt = await this.findReceiptById(receiptId);

    if (!receipt || receipt.userId.toString() !== userId) {
      throw new HttpException(
        'Receipt not found or not owned by the user',
        HttpStatus.NOT_FOUND,
      );
    }

    let binaryImage: Binary;

    // Handle image update or keep existing one
    if (updateReceiptDto.image && updateReceiptDto.image.buffer) {
      binaryImage = new Binary(Buffer.from(updateReceiptDto.image.buffer));
    } else {
      binaryImage = receipt.image;
    }

    // Merge updated DTO into the existing entity
    Object.assign(receipt, plainToInstance(ReceiptEntity, updateReceiptDto));
    receipt.image = binaryImage;

    const updatedReceipt = await this.receiptRepository.save(receipt);
    return this.buildReceiptResponse(updatedReceipt);
  }

  // Delete a receipt (ensure it belongs to the user)
  async deleteReceipt(userId: string, receiptId: string): Promise<void> {
    const receipt = await this.findReceiptById(receiptId);

    if (!receipt || receipt.userId.toString() !== userId) {
      throw new HttpException(
        'Receipt not found or not owned by the user',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.receiptRepository.remove(receipt);
  }

  // Find receipt by ID
  async findReceiptById(receiptId: string): Promise<ReceiptEntity> {
    const receipt = await this.receiptRepository.findOneBy({
      _id: new ObjectId(receiptId),
    });
    if (!receipt) {
      throw new HttpException('Receipt not found', HttpStatus.NOT_FOUND);
    }
    return receipt;
  }

  // Get all receipts for a user
  async getReceiptsByUser(userId: string): Promise<ReceiptResponseDto[]> {
    const receipts = await this.receiptRepository.find({
      where: { userId: new ObjectId(userId) },
    });
    return receipts.map((receipt) => this.buildReceiptResponse(receipt));
  }

  private async processReceiptWithFlask(
    image: Express.Multer.File,
  ): Promise<any> {
    try {
      const formData = new FormData();

      // Append the image to the form data
      formData.append('file', image.buffer, {
        filename: image.originalname, // Use the original filename
        contentType: image.mimetype, // Use the correct mime type from the file
      });

      const response = await axios.post(
        'http://receipt-service:8081/upload',
        formData,
        {
          headers: formData.getHeaders(), // Ensures the correct Content-Type headers are set
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error processing receipt with Flask', error.message);
      this.logger.error('Full error stack:', error.stack);

      console.log(error);

      throw new HttpException(
        'Receipt processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Build receipt response DTO
  private buildReceiptResponse(receipt: ReceiptEntity): ReceiptResponseDto {
    // Use class-transformer to convert entity to DTO
    return plainToInstance(ReceiptResponseDto, {
      ...receipt,
      image: Buffer.from(receipt.image.buffer).toString('base64'), // Convert image to base64 string
    });
  }
}
