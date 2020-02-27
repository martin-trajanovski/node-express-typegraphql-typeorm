import 'reflect-metadata';
import { config } from 'dotenv';

import 'module-alias/register';
import App from './app';
import { validateEnv } from './utils';

config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

validateEnv();

const app = new App();

app.listen();
