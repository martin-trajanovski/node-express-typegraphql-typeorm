import { Resolver, Query, Authorized, Ctx } from 'type-graphql';

import { User } from '@src/entities';
import { Context } from '@src/interfaces';
import { UserService } from '@src/services';

@Resolver()
class UserResolver {
  constructor(private readonly userService: UserService) {}
  @Authorized()
  @Query(() => User)
  async me(@Ctx() ctx: Context) {
    try {
      const me = this.userService.me(ctx.user.id);

      return me;
    } catch (error) {
      throw new Error(`Something went wrong: ${error}`);
    }
  }
}

export default UserResolver;
