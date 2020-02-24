import * as jwt from 'jsonwebtoken';
import { AuthChecker } from 'type-graphql';

import { Roles } from '@src/graphql/types/roles.enum';
import { Context, UserInterface } from '@src/interfaces';

import { redis } from '.';

const authChecker: AuthChecker<Context, Roles> = async ({ context }, roles) => {
  let authToken = context.req.headers['authorization'];

  if (!authToken) {
    throw new Error('Missing token');
  }

  authToken = authToken.replace('Bearer ', '');

  if (authToken) {
    const secret = process.env.AUTH_TOKEN_SECRET as string;
    try {
      if (redis.getClient && redis.getClient.connected) {
        // NOTE: Check if user is already logged out and the authToken is blacklisted.
        const authTokenBlacklisted = await redis.getAsync(authToken);

        if (authTokenBlacklisted) {
          throw new Error('Wrong credentials');
        }
      }

      const verificationResponse = jwt.verify(
        authToken,
        secret
      ) as UserInterface;
      const user = verificationResponse;

      if (user && user.id) {
        context.user = user;

        if (roles.length === 0) {
          return true;
        }

        if (user.roles.some(role => roles.includes(role))) {
          return true;
        } else {
          throw new Error('Wrong credentials');
        }
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
