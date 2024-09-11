import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  HttpCode,
} from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { CreateReceiptDto, UpdateReceiptDto, ReceiptResponseDto } from './dto';
import { ValidationPipe } from '../shared/pipes/validation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '../user/user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('receipts')
@Controller('receipts')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  // Stage 1: Process receipt image and return details without saving
  @Post('process')
  @ApiOperation({
    summary: 'Upload receipt image for processing (does not store the receipt)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Receipt image processed successfully and data returned.',
    type: ReceiptResponseDto,
  })
  @UseInterceptors(FileInterceptor('image'))
  async processReceipt(
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ReceiptResponseDto> {
    return this.receiptService.processReceipt(image);
  }

  // Stage 2: Confirm and create receipt in the database
  @UsePipes(new ValidationPipe())
  @Post('create')
  @ApiOperation({ summary: 'Create receipt with the confirmed details' })
  @ApiResponse({
    status: 201,
    description: 'Receipt successfully created.',
    type: ReceiptResponseDto,
  })
  async createReceipt(
    @User('_id') userId: string,
    @Body() createReceiptDto: CreateReceiptDto,
  ): Promise<ReceiptResponseDto> {
    return this.receiptService.createReceipt(userId, createReceiptDto);
  }

  @UsePipes(new ValidationPipe())
  @Put(':id')
  @ApiOperation({ summary: 'Update receipt' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Receipt successfully updated.',
    type: ReceiptResponseDto,
  })
  @UseInterceptors(FileInterceptor('image'))
  async updateReceipt(
    @User('_id') userId: string,
    @Param('id') receiptId: string,
    @Body() updateReceiptDto: UpdateReceiptDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ReceiptResponseDto> {
    updateReceiptDto.image = image || null;
    return this.receiptService.updateReceipt(
      userId,
      receiptId,
      updateReceiptDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete receipt' })
  @ApiResponse({ status: 204, description: 'Receipt successfully deleted.' })
  @HttpCode(204)
  async deleteReceipt(
    @User('_id') userId: string,
    @Param('id') receiptId: string,
  ): Promise<void> {
    return this.receiptService.deleteReceipt(userId, receiptId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all receipts for the user' })
  @ApiResponse({
    status: 200,
    description: 'Receipts retrieved successfully.',
    type: [ReceiptResponseDto],
  })
  async getReceiptsByUser(
    @User('_id') userId: string,
  ): Promise<ReceiptResponseDto[]> {
    return this.receiptService.getReceiptsByUser(userId);
  }
}
