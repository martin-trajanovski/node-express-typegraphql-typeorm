import { Request } from 'express';

import { UserInterface } from '.';

export interface RequestWithUser extends Request {
  user: UserInterface;
}
