import * as jwt from 'jsonwebtoken';
import { AuthChecker } from 'type-graphql';

import { Context } from '@src/interfaces';
import { User } from '@src/interfaces/user.interface';

const authChecker: AuthChecker<Context> = ({ context }) => {
  let authToken = context.req.headers['authorization'];

  if (!authToken) {
    throw new Error('Missing token');
  }

  authToken = authToken.replace('Bearer ', '');

  if (authToken) {
    const secret = process.env.AUTH_TOKEN_SECRET as string;
    try {
      // if (redisClient.getClient && redisClient.getClient.connected) {
      //   // NOTE: Check if user is already logged out and the authToken is blacklisted.
      //   const authTokenBlacklisted = await redisClient.getAsync(authToken);

      //   if (authTokenBlacklisted) {
      //     return next(new Error('Wrong credentials'));
      //   }
      // }

      const verificationResponse = jwt.verify(authToken, secret) as User;
      const user = verificationResponse;

      if (user && user.id) {
        context.user = user;

        return true;
      } else {
        throw new Error('Wrong credentials');
      }
    } catch (error) {
      throw new Error('Wrong credentials');
    }
  } else {
    throw new Error('Missing token');
  }
};

export default authChecker;
