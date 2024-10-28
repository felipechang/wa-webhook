/**
 * Logger instance.
 */
import winston from "winston";

// Create a logger
export const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            format: winston.format.prettyPrint(),
        }),
    ],
});