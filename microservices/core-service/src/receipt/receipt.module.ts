import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptService } from './receipt.service';
import { ReceiptController } from './receipt.controller';
import { ReceiptEntity } from './receipt.entity';
import { AuthMiddleware } from '../user/auth.middleware'; // Reusing the auth middleware from UserModule
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReceiptEntity]),
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
      .forRoutes({ path: '/receipts/*', method: RequestMethod.ALL }); // Apply middleware to all Receipt routes
  }
}
