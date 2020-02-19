import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, colorize, printf, splat } = format;

// TODO: Move this to middleware folder.
const myFormat = printf(info => {
  return `${info.timestamp} ${info.label} ${info.level}: ${info.message}`;
});

const logger = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({
      filename: './logs/logs.log',
      level: 'error',
    }),
  ],
  format: combine(
    colorize(),
    label({ label: '[app-server]' }),
    timestamp(),
    splat(),
    myFormat
  ),
});

if (process.env.NODE_ENV !== 'production') {
  logger.debug('Logging initialized at debug level');
}

export default logger;
