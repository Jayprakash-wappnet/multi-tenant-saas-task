import { RequestUser } from '../common/interfaces/request-user.interface';

declare module 'express-serve-static-core' {
  interface Request {
    user?: RequestUser;
  }
}