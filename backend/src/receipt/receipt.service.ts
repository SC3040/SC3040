import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Receipt, ReceiptDocument } from './schemas/receipt.schema';
import { CreateReceiptDto, UpdateReceiptDto, ReceiptResponseDto } from './dto';
import * as FormData from 'form-data';
import axios from 'axios';
import { UserService } from '../user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { parse } from 'date-fns';
import { TrackErrors } from '../metrics/function-error.decorator';

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);

  constructor(
    @InjectModel(Receipt.name)
    private readonly receiptModel: Model<ReceiptDocument>,
    private readonly userService: UserService,
  ) {}

  // Stage 1: Process receipt image and return data without saving
  @TrackErrors
  async processReceipt(
    userId: string,
    image: Express.Multer.File,
  ): Promise<ReceiptResponseDto> {
    if (!image) {
      throw new HttpException('No image uploaded', HttpStatus.BAD_REQUEST);
    }

    // Send the image directly to Flask for processing (no need for Binary conversion)
    const flaskResponse = await this.processReceiptWithFlask(userId, image);
    this.logger.log('Flask Response:', JSON.stringify(flaskResponse));

    // Attempt to parse the date with custom format "DD/MM/YYYY"
    let receiptDate: string;
    try {
      const parsedDate = parse(flaskResponse.date, 'dd/MM/yyyy', new Date());
      receiptDate = parsedDate.toISOString();
    } catch {
      this.logger.error(`Invalid date format received: ${flaskResponse.date}`);
      receiptDate = ''; // Fallback to empty string or another default value
    }

    // Map Flask response fields to internal naming convention
    return {
      id: '',
      merchantName: flaskResponse.merchant_name,
      date: receiptDate,
      totalCost: parseInt(flaskResponse.total_cost),
      category: flaskResponse.category,
      itemizedList: flaskResponse.itemized_list
        ? flaskResponse.itemized_list.map((item) => ({
            itemName: item.item_name,
            itemQuantity: parseInt(item.item_quantity),
            itemCost: parseInt(item.item_cost),
          }))
        : [], // Fallback to empty array if itemized_list is missing
      userId: '',
    };
  }

  // Stage 2: Create a new receipt for the user
  @TrackErrors
  async createReceipt(
    userId: string,
    createReceiptDto: CreateReceiptDto,
  ): Promise<ReceiptResponseDto> {
    // Parse the date (try both ISO and dd/MM/yyyy formats)
    let parsedDate: Date | null = null;
    if (createReceiptDto.date) {
      parsedDate = this.parseDate(createReceiptDto.date);
      if (!parsedDate) {
        this.logger.error(
          `Invalid date format received: ${createReceiptDto.date}`,
        );
        throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
      }
    }

    this.logger.log('Creating receipt for user:', userId);

    // Save receipt with image buffer in the database
    const receipt = new this.receiptModel({
      ...createReceiptDto,
      date: parsedDate,
      userId,
    });

    const savedReceipt = await receipt.save();
    return this.buildReceiptResponse(savedReceipt);
  }

  // Update an existing receipt
  @TrackErrors
  async updateReceipt(
    userId: string,
    receiptId: string,
    updateReceiptDto: UpdateReceiptDto,
  ): Promise<ReceiptResponseDto> {
    const receipt = await this.receiptModel.findById(receiptId);

    if (!receipt || receipt.userId !== userId) {
      throw new HttpException(
        'Receipt not found or not owned by the user',
        HttpStatus.NOT_FOUND,
      );
    }

    // Parse the date (try both ISO and dd/MM/yyyy formats)
    let parsedDate: Date | null = null;
    if (updateReceiptDto.date) {
      parsedDate = this.parseDate(updateReceiptDto.date);
      if (!parsedDate) {
        this.logger.error(
          `Invalid date format received: ${updateReceiptDto.date}`,
        );
        throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
      }
    }

    Object.assign(receipt, updateReceiptDto);
    if (parsedDate) {
      receipt.date = parsedDate; // Set the parsed date
    }

    const updatedReceipt = await receipt.save();
    return this.buildReceiptResponse(updatedReceipt);
  }

  // Delete a receipt
  @TrackErrors
  async deleteReceipt(
    userId: string,
    receiptId: string,
  ): Promise<{ message: string }> {
    this.logger.log('Deleting receipt:', receiptId);
    const receipt = await this.receiptModel.findById(receiptId);
    if (!receipt || receipt.userId !== userId.toString()) {
      throw new HttpException(
        'Receipt not found or not owned by the user',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.receiptModel.deleteOne({ _id: receiptId });
    return { message: 'Receipt successfully deleted.' };
  }

  // Get all receipts for a user
  @TrackErrors
  async getReceiptsByUser(userId: string): Promise<ReceiptResponseDto[]> {
    this.logger.log('Fetching receipts for user:', userId);
    const receipts = await this.receiptModel.find({ userId });
    this.logger.log('Found receipts:', receipts.length);
    return receipts.map((receipt) => this.buildReceiptResponse(receipt));
  }

  private async processReceiptWithFlask(
    userId: string, // Add userId parameter
    image: Express.Multer.File,
  ): Promise<any> {
    // Fetch the user's API token information
    const user = await this.userService.findEntityById(userId);
    if (!user || !user.apiToken) {
      throw new HttpException(
        'User or API token not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Determine model and API key
    const model = user.apiToken.defaultModel;
    let geminiKey: string, openaiKey: string;

    try {
      ({ geminiKey, openaiKey } = this.userService.getDecryptedApiKey(
        user,
        model,
      ));
      // this.logger.log(`geminiKey: ${geminiKey}, openaiKey: ${openaiKey}`);
    } catch (error) {
      throw new HttpException(
        `API key not set for the selected model: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const formData = new FormData();

      // Append the image as a file
      formData.append('file', image.buffer, {
        filename: image.originalname,
        contentType: image.mimetype,
      });

      // Append model and api keys to the form data
      formData.append('defaultModel', model);
      formData.append('geminiKey', geminiKey);
      formData.append('openaiKey', openaiKey);

      this.logger.log('Sending image to Flask for processing');

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

      throw new HttpException(
        'Receipt processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Utility function to handle both date formats
  private parseDate(dateString: string): Date | null {
    // Try to parse the ISO date format first
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
      return isoDate; // Return if it's a valid ISO date
    }

    // If it's not a valid ISO date, try parsing it as "dd/MM/yyyy"
    try {
      return parse(dateString, 'dd/MM/yyyy', new Date());
    } catch {
      this.logger.log('Invalid date format received:', dateString);
      return null; // Return null if neither format is valid
    }
  }

  // Build receipt response DTO
  private buildReceiptResponse(receipt: ReceiptDocument): ReceiptResponseDto {
    const { _id, image, ...rest } = receipt.toObject({ versionKey: false });

    return {
      id: _id, // Add the 'id' field with the value of '_id'
      ...rest, // Spread all other fields except _id and image
      image: image?.toString('base64'), // Convert image buffer to base64 if exists
    };
  }
}
