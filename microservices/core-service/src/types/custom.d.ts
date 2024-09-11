import { UserEntity } from '../user/user.entity';

declare module 'express' {
  export interface Request {
    user?: UserEntity;
  }
}
