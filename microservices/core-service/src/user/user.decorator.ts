import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const logger = new Logger('UserDecorator');
    const request = ctx.switchToHttp().getRequest();

    logger.log(`Authorization header: ${request.headers.authorization}`);
    // If user is already populated by middleware
    if (request.user) {
      logger.log('User found in request object, returning user.');
      return data ? request.user[data] : request.user;
    }

    const token = request.headers.authorization?.split(' ')[1];

    // If the user is not populated, decode the token
    if (token) {
      const decoded = jwt.verify(token, new ConfigService().get('JWT_SECRET'));
      return data ? decoded[data] : decoded;
    }

    return null;
  },
);
