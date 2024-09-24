import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ReceiptModule } from './receipt/receipt.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      // Load environment variables from compose.yaml
      isGlobal: true, // Makes ConfigModule available globally
    }),

    // Set up Mongoose for MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    ReceiptModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
