import pino from "pino";
import { config } from "../config";

export const logger = pino({
  level: config.isTest ? "silent" : config.logLevel,
  transport:
    !config.isProduction && !config.isTest
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "SYS:standard",
          },
        }
      : undefined,
});

