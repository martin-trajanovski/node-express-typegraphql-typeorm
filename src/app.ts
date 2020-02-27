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

import { Todo, User } from './entities';
import { AuthResolver, TodoResolver, UserResolver } from './graphql/resolvers';
import { RequestWithUser } from './interfaces';
import { authChecker, logger, redis } from './utils';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();

    this.connectToTheDatabase();
    this.createRedisClient();
    this.initializeMiddlewares();
    this.initializeGraphQLServer();
    this.initializeNotFoundRoute();
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
    this.app.use(cors());
    this.app.use(lusca.xframe('SAMEORIGIN'));
    this.app.use(lusca.xssProtection(true));
  }

  private initializeNotFoundRoute() {
    this.app.use(/^(?!\/api\/?$)/, function(req, res) {
      res
        .status(200)
        .send('<h2 style="text-align: center;">Not found! Nice try btw!</h2>');
    });
  }

  private async initializeGraphQLServer() {
    const schema = await buildSchema({
      resolvers: [AuthResolver, TodoResolver, UserResolver],
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

    try {
      await createConnection(connectionOptions);
    } catch (error) {
      logger.error(`Database connection error: ${error}`);
    }
  }

  private createRedisClient() {
    redis.create();
  }
}

export default App;
