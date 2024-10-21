import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ReceiptModule } from './receipt/receipt.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MetricsModule } from './metrics/metrics.module';
import { ReporterModule } from './reporter/reporter.module';
import { RequestTimingMiddleware } from './metrics/request-timing.middleware';
import { ErrorTrackingMiddleware } from './metrics/error-tracking.middleware'; // Import the middleware
import { RequestConcurrencyMiddleware } from './metrics/request-concurrency.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
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
    MetricsModule,
    ReporterModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply RequestTimingMiddleware globally for all routes
    consumer
      .apply(RequestConcurrencyMiddleware)
      .exclude({ path: '/metrics', method: RequestMethod.ALL })
      .forRoutes('*');
    consumer
      .apply(RequestTimingMiddleware)
      .exclude({ path: '/metrics', method: RequestMethod.ALL })
      .forRoutes('*');
    // Apply ErrorTrackingMiddleware globally for all routes
    consumer.apply(ErrorTrackingMiddleware).forRoutes('*');
  }
}
