/**
 * Winston 기반의 로깅 인스턴스를 정의합니다.
 * 로그 레벨별로 파일 분리 및 콘솔 출력까지 지원하며,
 * HTTP 요청 로깅을 위해 custom "http" 레벨도 포함합니다.
 */

import winston, { Logger } from 'winston';
import fs from 'node:fs';
import path from 'node:path';

const logDir = path.resolve('logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// ✅ 커스텀 로그 레벨 및 색상 정의
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'cyan',
    debug: 'blue',
  },
};

winston.addColors(customLevels.colors);

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

// ✅ Winston Logger 인스턴스 생성
export const logger: Logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    new winston.transports.Console({
      format: combine(colorize({ all: true }), timestamp(), logFormat),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'info.log'),
      level: 'info',
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'http.log'),
      level: 'http',
    }),
  ],
});

// ✅ 전역 예외 및 비동기 예외 로깅
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}\n${error.stack}`);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});
