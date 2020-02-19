import { Request } from 'express';

import { User } from './user.interface';

export interface Context {
  req: Request;
  user: User;
}
