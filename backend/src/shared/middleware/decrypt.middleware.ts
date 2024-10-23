import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { decryptWithBackendPrivateKey } from '../utils/encryption.util';

// For decrypting incoming requests
@Injectable()
export class DecryptMiddleware implements NestMiddleware {
  logger = new Logger('DecryptMiddleware');

  use(req: Request, res: Response, next: NextFunction) {
    const encryptedPayload = req.body.payload;
    this.logger.log(
      'Decrypting incoming request payload of:',
      encryptedPayload,
    );

    if (encryptedPayload) {
      try {
        const decryptedData = decryptWithBackendPrivateKey(encryptedPayload);
        // Replace the encrypted payload with decrypted data
        req.body = JSON.parse(decryptedData);
        this.logger.log('Decrypted payload:', decryptedData);
      } catch {
        throw new BadRequestException('Invalid encrypted payload');
      }
    }

    next();
  }
}
