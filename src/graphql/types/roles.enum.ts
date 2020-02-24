import { registerEnumType } from 'type-graphql';

export enum Roles {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

registerEnumType(Roles, {
  name: 'Roles',
  description: 'User roles',
});
