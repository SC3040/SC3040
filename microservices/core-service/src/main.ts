import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const appOptions = { cors: true };
  const app = await NestFactory.create(AppModule, appOptions);
  app.setGlobalPrefix('api');

  // Enable cookie-parser
  app.use(cookieParser());

  // Set up CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true, // Allow cookies to be included in requests
  });

  const options = new DocumentBuilder()
    .setTitle('ExpenseNote')
    .setDescription('An easy way to manage and track your personal finances')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(8080);
}
bootstrap();
