import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Load environment variables from compose.yaml
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
    }),

    // Set up TypeORM for MongoDB connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('MONGODB_URI'), // Use the MONGODB_URI environment variable
        useUnifiedTopology: true,
        synchronize: true, // For development only. To set this to false in production.
        entities: [__dirname + '/**/*.entity.ts'], // Path to entities
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
