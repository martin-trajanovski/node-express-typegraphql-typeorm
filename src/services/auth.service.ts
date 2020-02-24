import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Service } from 'typedi';

import { User } from '@src/entities';
import { CreateUserInput, LoginUserInput } from '@src/graphql/inputs';
import { Roles } from '@src/graphql/types/roles.enum';
import { UserInterface, TokenData } from '@src/interfaces';
import { redis } from '@src/utils';

const AUTH_TOKEN_EXPIRATION = 60 * 60; // 1 hour

@Service()
class AuthService {
  public async register(userData: CreateUserInput): Promise<User> {
    if (await User.findOne({ email: userData.email })) {
      throw new Error('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = User.create({
      ...userData,
      password: hashedPassword,
      roles: [Roles.USER],
    });

    await user.save();

    user.password = '';

    return user;
  }

  public async login(
    logInData: LoginUserInput
  ): Promise<UserInterface & TokenData> {
    const user = await User.findOne({
      where: {
        email: logInData.email,
      },
    });

    if (user) {
      const isPasswordMatching = await bcrypt.compare(
        logInData.password,
        user.password
      );

      if (isPasswordMatching) {
        user.password = '';
        const authToken = this.createToken(user);

        return { ...user, ...authToken };
      } else {
        throw new Error('Wrong credentials');
      }
    } else {
      throw new Error('Wrong credentials');
    }
  }

  public async logout(authToken: string): Promise<boolean> {
    if (redis.getClient && redis.getClient.connected) {
      const secret = process.env.AUTH_TOKEN_SECRET as string;
      jwt.verify(authToken, secret);

      if (authToken) {
        // NOTE: Set the auth token as blacklisted and make it expire after AUTH_TOKEN_EXPIRATION.
        redis.getClient.set(authToken, 'blacklisted');
        redis.getClient.expire(authToken, AUTH_TOKEN_EXPIRATION);
      } else {
        throw new Error('Missing token');
      }
    }

    return true;
  }

  private createToken(user: User): TokenData {
    delete user.password;
    const expiresInMS = AUTH_TOKEN_EXPIRATION * 1000;
    const expiresAt = new Date(Date.now() + expiresInMS).getTime();
    const secret = process.env.AUTH_TOKEN_SECRET as string;
    const dataStoredInToken: UserInterface = { ...user };

    return {
      expiresAt,
      token: jwt.sign(dataStoredInToken, secret, {
        expiresIn: AUTH_TOKEN_EXPIRATION,
      }),
    };
  }
}

export default AuthService;
