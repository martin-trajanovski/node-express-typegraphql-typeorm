import { createClient, RedisClient, RedisError } from 'redis';

import logger from './logger';

class Redis {
  private client: RedisClient;

  public create(): void {
    this.client = createClient({
      host: process.env.REDIS_HOST,
    });

    this.client.on('connect', () => {
      logger.info('Redis client connected');
    });

    this.client.on('error', (error: RedisError) => {
      logger.error('Redis not connected: ', error);
    });

    this.client.on('end', () => {
      logger.error('Redis connection has been closed');
    });
  }

  public get getClient(): RedisClient {
    return this.client;
  }

  public getAsync(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, reply) => {
        if (error) {
          logger.error(error);

          reject(error);
        }

        resolve(reply);
      });
    });
  }
}

export default new Redis();
