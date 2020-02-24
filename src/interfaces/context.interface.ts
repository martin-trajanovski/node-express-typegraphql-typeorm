import { Request } from 'express';

import { UserInterface } from '.';

export interface Context {
  req: Request;
  user: UserInterface;
}
