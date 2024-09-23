import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { ReceiptController } from './receipt.controller';
import { Receipt, ReceiptSchema } from './schemas/receipt.schema';
import { AuthMiddleware } from '../user/auth.middleware'; // Reusing the auth middleware from UserModule
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Receipt.name, schema: ReceiptSchema }]),
    ConfigModule,
    UserModule,
  ],
  providers: [ReceiptService],
  controllers: [ReceiptController],
  exports: [ReceiptService],
})
export class ReceiptModule {
  // Apply the AuthMiddleware to all routes in the ReceiptModule
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/receipts', method: RequestMethod.ALL },
        { path: '/receipts/*', method: RequestMethod.ALL },
      ); // Apply middleware to all Receipt routes
  }
}
