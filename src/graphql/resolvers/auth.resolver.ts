import { Resolver, Query, Mutation, Arg } from 'type-graphql';

import { User } from '@src/entities';
import { TokenData } from '@src/interfaces';
import { AuthService } from '@src/services';

import { CreateUserInput, LoginUserInput } from '../inputs';
import UserWithToken from '../types/UserWithToken';

@Resolver()
class AuthResolver {
  constructor(private readonly authService: AuthService) {}
  @Query(() => UserWithToken)
  async login(@Arg('data') data: LoginUserInput): Promise<TokenData> {
    try {
      const userWithToken = await this.authService.login(data);

      return userWithToken;
    } catch (error) {
      throw new Error(`Something went wrong: ${error}`);
    }
  }

  @Mutation(() => User)
  async register(@Arg('data') data: CreateUserInput) {
    try {
      const user = await this.authService.register(data);

      return user;
    } catch (error) {
      throw new Error(`Something went wrong: ${error}`);
    }
  }

  @Mutation(() => Boolean)
  async logout(@Arg('authToken') authToken: string) {
    try {
      const result = await this.authService.logout(authToken);

      return result;
    } catch (error) {
      throw new Error(`Something went wrong: ${error}`);
    }
  }
}

export default AuthResolver;
