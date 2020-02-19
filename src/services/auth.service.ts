import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Service } from 'typedi';

import User from '@src/entities/User';
import CreateUserInput from '@src/graphql/inputs/createUser.input';
import LoginUserInput from '@src/graphql/inputs/loginUser.input';
import { DataStoredInToken, TokenData } from '@src/interfaces';
// import redisClient from '@src/utils/redis';

const AUTH_TOKEN_EXPIRATION = 60 * 60; // 1 hour
// const REFRESH_TOKEN_EXPIRATION = 60 * 60 * 60; // 1 day

@Service()
export class AuthService {
  public async register(userData: CreateUserInput): Promise<User> {
    if (await User.findOne({ email: userData.email })) {
      throw new Error('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = User.create({
      ...userData,
      password: hashedPassword,
    });

    await user.save();

    user.password = '';

    return user;
  }

  public async login(logInData: LoginUserInput): Promise<TokenData> {
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
        // const refreshToken = await this.createRefreshToken(user);
        // await this.logUserActivity(user, 'login');

        // if (redisClient.getClient && redisClient.getClient.connected) {
        //   redisClient.getClient.set(refreshToken, authToken.token);
        //   redisClient.getClient.expire(refreshToken, REFRESH_TOKEN_EXPIRATION);
        // }

        return { ...user, ...authToken };
      } else {
        throw new Error('Wrong credentials');
      }
    } else {
      throw new Error('Wrong credentials');
    }
  }

  // public async logout(refreshToken: string) {
  //   if (redisClient.getClient && redisClient.getClient.connected) {
  //     const authTokenInRedis = await redisClient.getAsync(refreshToken);

  //     // NOTE: Set the auth token as blacklisted and make it expire after AUTH_TOKEN_EXPIRATION.
  //     redisClient.getClient.set(authTokenInRedis, 'blacklisted');
  //     redisClient.getClient.expire(authTokenInRedis, AUTH_TOKEN_EXPIRATION);

  //     if (authTokenInRedis) {
  //       redisClient.getClient.del(refreshToken);
  //     }
  //   }

  //   return {
  //     success: true,
  //   };
  // }

  // public refreshToken = async (refreshToken: string) => {
  //   let authTokenInRedis;
  //   let redisIsDown = false;

  //   if (redisClient.getClient && redisClient.getClient.connected) {
  //     authTokenInRedis = await redisClient.getAsync(refreshToken);
  //   } else {
  //     redisIsDown = true;
  //   }

  //   if (authTokenInRedis || redisIsDown) {
  //     const user = await this.validateRefreshToken(refreshToken);
  //     const authToken = this.createToken(user);

  //     return authToken;
  //   } else {
  //     throw new HttpException(401, 'Refresh token expired - session ended.');
  //   }
  // };

  // private validateRefreshToken = async (refreshToken: string) => {
  //   const secret = process.env.REFRESH_TOKEN_SECRET;

  //   try {
  //     jwt.verify(refreshToken, secret);
  //   } catch (error) {
  //     this.logout(refreshToken);

  //     throw new HttpException(401, 'Refresh token expired - session ended.');
  //   }

  //   try {
  //     const user = await this.user.findOne({ refreshToken });

  //     return user;
  //   } catch (error) {
  //     throw new HttpException(500, 'Something went wrong!');
  //   }
  // };

  private createToken(user: User): TokenData {
    delete user.password;
    const expiresInMS = AUTH_TOKEN_EXPIRATION * 1000;
    const expiresAt = new Date(Date.now() + expiresInMS).getTime();
    const secret = process.env.AUTH_TOKEN_SECRET as string;
    const dataStoredInToken: DataStoredInToken = { ...user };

    return {
      expiresAt,
      token: jwt.sign(dataStoredInToken, secret, {
        expiresIn: AUTH_TOKEN_EXPIRATION,
      }),
    };
  }

  // private async createRefreshToken(user: User): Promise<string> {
  //   const secret = process.env.REFRESH_TOKEN_SECRET;

  //   const refreshToken = jwt.sign({ type: 'refresh' }, secret, {
  //     expiresIn: REFRESH_TOKEN_EXPIRATION,
  //   });

  //   await User.findOneAndUpdate({ email: user.email }, { refreshToken });

  //   // TODO: Update all depredated mongoose functions. There are warnings in the console, check them all!
  //   return refreshToken;
  // }

  // public logUserActivity = (user: User, activity: string) => {
  //   return LoginActivity.create({ userID: user._id, activityType: activity });
  // };
}
