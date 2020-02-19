import { ObjectType, Field } from 'type-graphql';

import User from '@src/entities/User';

@ObjectType()
class UserWithToken extends User {
  @Field(() => String)
  token: string;

  @Field(() => String)
  expiresAt: string;
}

export default UserWithToken;
