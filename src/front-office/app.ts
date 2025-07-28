import type { Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import { generateSwaggerSpec } from '../core/config/SwaggerConfig';
import process from 'node:process';
import { AppDataSource } from '../core/config/DatabaseConfig';
import { logger } from '../core/utilities/Logger';
import path from 'node:path';
import { authenticateJwt } from '../core/middlewares/JwtAuthenticationMiddleware';
import { initializeEncryptCommonKeyAndIV } from '../core/utilities/EncyprtKeyManager';
import cookieParser from 'cookie-parser';
import { corsOptions } from '../core/utilities/Secret';

const app = express();
const rootPath = path.resolve(__dirname, '../../..');
const serverName: string = 'backend-common';
const serverEnvironment = process.env.NODE_ENV ?? 'local';

app.use(cors(corsOptions));
app.use(express.json());
app.use(authenticateJwt);

/**
 * Swagger 문서 자동 생성
 */
generateSwaggerSpec(app, {
  version: '0.0.0',
  description: 'backend front-office 서비스 API',
  serverUrl: process.env.SERVER_URL || 'http://localhost',
  port: Number(process.env.PORT) || 8000,
  apiFiles: [
    path.resolve(__dirname, './api/controllers/**/*.ts'),
    path.resolve(__dirname, '../core/models/dtos/**/*.ts'),
  ],
});

/**
 * TypeORM 데이터 소스 초기화
 */
AppDataSource.initialize()
  .then(async () => {
    logger.info('Data Source (데이터 소스) 가 초기화 되었어요.');
  })
  .catch((error) => {
    logger.error(
      `Data Source (데이터 소스) 초기화 실패하였어요. \n 실패 이유: ${error.message}`
    );
  });

initializeEncryptCommonKeyAndIV(serverName, serverEnvironment)
  .then(() => logger.info('공통 암/복호화 키 초기화 완료 하였어요.'))
  .catch((error: any) => {
    logger.error(
      '공통 암/복호화 키 초기화 중 에러 발생하였어요. \n 에러 내용: ',
      error
    );
    process.exit(1);
  });

app.use(cookieParser());

/**
 * 헬스 체크 API
 */
app.get('/health', (request: Request, response: Response) =>
  response.json({ status: 'OK' })
);

export default app;
