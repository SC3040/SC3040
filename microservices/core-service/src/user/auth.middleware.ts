import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, _: Response, next: NextFunction) {
    const authHeaders = req.headers.authorization;

    if (authHeaders && (authHeaders as string).split(' ')[1]) {
      const token = (authHeaders as string).split(' ')[1];

      try {
        const decoded: any = jwt.verify(
          token,
          this.configService.get('JWT_SECRET'),
        );
        this.logger.log(`Decoded token: ${JSON.stringify(decoded)}`);

        const user = await this.userService.findEntityById(decoded.id);
        this.logger.log('User found for decoded token ID');

        if (!user) {
          this.logger.warn('User not found for decoded token ID');
          throw new HttpException('User not found.', HttpStatus.UNAUTHORIZED);
        }

        req.user = user;
        this.logger.log('User attached to request object');
        next();
      } catch (error) {
        this.logger.error(
          'Error verifying token or fetching user',
          error.stack,
        ); // Log the error with stack trace
        throw new HttpException('Not authorized.', HttpStatus.UNAUTHORIZED);
      }
    } else {
      this.logger.warn('Authorization header missing or malformed');
      throw new HttpException('Not authorized.', HttpStatus.UNAUTHORIZED);
    }
  }
}
