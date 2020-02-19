import { Resolver, Query, Mutation, Arg } from 'type-graphql';

import User from '@src/entities/User';
import { TokenData } from '@src/interfaces';
import { AuthService } from '@src/services';

import CreateUserInput from '../inputs/createUser.input';
import LoginUserInput from '../inputs/loginUser.input';
import UserWithToken from '../types/UserWithToken';

@Resolver()
class AuthResolver {
  constructor(private readonly authService: AuthService) {}
  @Query(() => UserWithToken)
  async login(@Arg('data') data: LoginUserInput): Promise<TokenData> {
    const userWithToken = await this.authService.login(data);

    return userWithToken;
  }

  @Mutation(() => User)
  async register(@Arg('data') data: CreateUserInput) {
    const user = await this.authService.register(data);

    return user;
  }
}

export default AuthResolver;
