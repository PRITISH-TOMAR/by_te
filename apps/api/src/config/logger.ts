import winston from "winston";
import WinstonCloudWatch from "winston-cloudwatch";
import { v4 as uuidv4 } from "uuid";

const severityMap: Record<string, string> = {
  error: "HIGH",
  warn:  "MEDIUM",
  info:  "LOW",
  debug: "LOW",
};

const customFormat = winston.format.printf((info) => {
  const log = {
    component:   "BY_TE_API",
    timestamp:   new Date().toISOString(),
    level:       info.level.toUpperCase(),
    severity:    severityMap[info.level] || "LOW",
    tracebackId: info.tracebackId || uuidv4(),
    url:         info.url         || undefined,
    httpMethod:  info.httpMethod  || undefined,
    source:      info.source      || "unknown",
    data:        info.data        || undefined,
    message:     info.message,
    stackTrace:  info.stack       || undefined,
  };

  Object.keys(log).forEach((key) => {
    if (log[key as keyof typeof log] === undefined) {
      delete log[key as keyof typeof log];
    }
  });

  return JSON.stringify(log);
});

const transports: winston.transport[] = [
  // Always on — console
  new winston.transports.Console(),

  // File transports
  new winston.transports.File({ filename: "logs/info.log",  level: "info"  }),
  new winston.transports.File({ filename: "logs/error.log", level: "error" }),

  // CloudWatch transport
  new WinstonCloudWatch({
    logGroupName:  process.env.CLOUDWATCH_GROUP  || "/by-te/api",
    logStreamName: process.env.CLOUDWATCH_STREAM || "app-stream",
    awsRegion:     process.env.AWS_REGION        || "us-east-1",
    awsOptions: {
      credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID     || "test",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
      },
      // LocalStack in dev, real AWS in prod
      ...(process.env.APP_ENV !== "production" && {
        endpoint: "http://localstack:4566",
      }),
    },
    jsonMessage:      true,    // sends structured JSON as-is
    retentionInDays:  7,       // ignored by LocalStack, used in real AWS
  }),
];

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    customFormat
  ),
  transports,
});

export default logger;