import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import chalk from 'chalk';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import lusca from 'lusca';
import morgan from 'morgan';
import { buildSchema } from 'type-graphql';
import { Container } from 'typedi';
import { createConnection, ConnectionOptions } from 'typeorm';

import Todo from './entities/Todo';
import User from './entities/User';
import AuthResolver from './graphql/resolvers/auth.resolver';
import TodoResolver from './graphql/resolvers/todo.resolver';
import { RequestWithUser } from './interfaces/requestWithUser.interface';
import authChecker from './middlewares/auth.middleware';
import logger from './utils/logger';
import redis from './utils/redis';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();

    this.connectToTheDatabase();
    // this.createRedisClient();
    this.initializeMiddlewares();
    this.initializeGraphQLServer();
    // this.initializeNotFoundRoute();
  }

  public listen() {
    this.app.listen(process.env.PORT, () => {
      logger.info(
        `${chalk.green('✓')} App is running at http://localhost:${
          process.env.PORT
        } in ${this.app.get('env')} mode`
      );

      logger.info('Press CTRL-C to stop\n');
    });
  }

  private initializeMiddlewares() {
    this.app.use(compression());
    this.app.use(morgan('dev'));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    // TODO: See how origin can be set for production.
    this.app.use(cors({ origin: 'http://localhost:3000' }));
    this.app.use(lusca.xframe('SAMEORIGIN'));
    this.app.use(lusca.xssProtection(true));
  }

  private initializeNotFoundRoute() {
    this.app.get('/*', function(req, res) {
      res.status(404).send('<h3 style="text-align: center;">Nice try!</h3>');
    });
  }

  private async initializeGraphQLServer() {
    const schema = await buildSchema({
      resolvers: [AuthResolver, TodoResolver],
      container: Container,
      authChecker,
    });

    const apolloServer = new ApolloServer({
      schema,
      context: ({ req }: { req: RequestWithUser }) => {
        const context = {
          req,
          user: req.user,
        };

        return context;
      },
    });

    // this.app.use('/api', authMiddleware);

    apolloServer.applyMiddleware({ app: this.app, path: '/api' });
  }

  private async connectToTheDatabase() {
    const {
      DB_TYPE,
      DB_PATH,
      DB_PORT,
      DB_USER,
      DB_PASSWORD,
      DB_NAME,
    } = process.env;

    const connectionOptions = {
      type: DB_TYPE,
      host: DB_PATH,
      port: DB_PORT,
      username: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      entities: [User, Todo],
      synchronize: true,
      logging: false,
    } as ConnectionOptions;

    await createConnection(connectionOptions);
  }

  private createRedisClient() {
    redis.create();
  }
}

export default App;
