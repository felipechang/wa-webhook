/**
 * Logger instance.
 */
import winston from "winston";

// Create a logger
export const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.align(),
        winston.format.printf((info) => {
            return `${info.timestamp} ${info.level.toUpperCase()} - ${info.message}`;
        }),
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.cli(),
        }),
    ],
});