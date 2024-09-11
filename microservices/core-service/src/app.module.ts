import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // Load environment variables from compose.yaml
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
        entities: [__dirname + '/**/*.entity.{js,ts}'], // Path to entities
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Serve static content from 'public' directory
    }),
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
