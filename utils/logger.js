const winston = require('winston')
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'HH:mm:ss:ms' }),
        winston.format.colorize(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    }),
  ],
  exitOnError: false,
})

module.exports = logger
