import { cleanEnv, port, str, host } from 'envalid';

function validateEnv(): void {
  cleanEnv(process.env, {
    PORT: port(),
    DB_TYPE: str(),
    DB_PATH: str(),
    DB_PORT: port(),
    DB_PASSWORD: str(),
    DB_USER: str(),
    DB_NAME: str(),
    REDIS_HOST: host(),
    AUTH_TOKEN_SECRET: str(),
    REFRESH_TOKEN_SECRET: str(),
  });
}

export default validateEnv;
