const winston = require("winston");
const expressWinston = require("express-winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  colorize: true,

  transports: [
    new winston.transports.File({ filename: "logs/info.log", level: "info" }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
      statusLevels: true,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
        ),
      msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
    })
  );
}

const log = (options) =>
  expressWinston.logger({
    winstonInstance: logger,
    ...options,
  });

module.exports = {
  logger,
  log,
};
