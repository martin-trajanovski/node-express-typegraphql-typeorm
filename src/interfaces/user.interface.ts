import { Roles } from '@src/graphql/types/roles.enum';

export interface UserInterface {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: Roles[];
}
