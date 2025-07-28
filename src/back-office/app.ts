/**
 * Express 애플리케이션 초기화 설정 파일입니다.
 *
 * 이 파일은 공통 백엔드 서버의 기본 설정을 수행하며,
 * 주요 기능으로는 JSON 요청 처리, CORS 설정, Swagger 문서 자동 생성, 데이터베이스 연결 초기화 등이 있습니다.
 *
 * 주요 기능:
 * - express.json() 및 cors() 미들웨어 설정
 * - Swagger 문서 자동 생성 (`generateSwaggerSpec`)
 * - TypeORM 데이터 소스(AppDataSource) 초기화
 * - /health 엔드포인트 제공
 *
 * 주의사항:
 * - 이 모듈은 실제 서버를 실행하지 않으며, main.ts 등에서 `app.listen()`으로 실행해야 합니다.
 * - Swagger 대상 파일 경로는 `controllers`와 `dtos`를 모두 포함하고 있어야 합니다.
 */

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
 * Swagger 문서를 자동으로 생성하고 Express에 연결합니다.
 */

generateSwaggerSpec(app, {
  version: '0.0.0',
  description: 'backend 관리자용 API',
  serverUrl: process.env.SERVER_URL ?? 'http://localhost',
  port: Number(process.env.PORT) || 9000,
  apiFiles: [
    path.resolve(__dirname, './api/controllers/**/*.ts'),
    path.resolve(__dirname, '../core/models/dtos/**/*.ts'),
  ],
});

/**
 * TypeORM 데이터베이스 연결을 초기화합니다.
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
 * 헬스 체크용 엔드포인트입니다.
 *
 * @route GET /health
 * @returns { status: 'OK' }
 */
app.get('/health', (request: Request, response: Response) =>
  response.json({ status: 'OK' })
);

/**
 * Express 애플리케이션 인스턴스를 외부로 내보냅니다.
 * 서버 실행은 server.ts 에서 수행됩니다.
 */
export default app;
