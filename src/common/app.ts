/**
 * Common 서비스의 Express 애플리케이션 초기화 파일입니다.
 *
 * 이 모듈은 서버 실행 전 다음과 같은 설정을 수행합니다:
 * - JSON 파싱 및 CORS 허용 설정
 * - Swagger 문서 자동 생성
 * - TypeORM 데이터베이스 연결 초기화
 * - 헬스 체크 엔드포인트 제공
 *
 * 주요 특징:
 * - Swagger 문서는 지정된 컨트롤러 및 DTO 파일을 기준으로 자동 생성됩니다.
 * - 이 모듈은 `app.listen()` 없이 export만 수행하며, main.ts 등에서 실행됩니다.
 *
 * 주의사항:
 * - `.env`에 SERVER_URL, PORT, DB 관련 정보가 올바르게 설정되어 있어야 합니다.
 */

import type { Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import process from 'node:process';
import path from 'node:path';
import cookieParser from 'cookie-parser';

import { AppDataSource } from '../core/config/DatabaseConfig';
import { generateSwaggerSpec } from '../core/config/SwaggerConfig';
import { logger } from '../core/utilities/Logger';
import 'reflect-metadata';
import { authenticateJwt } from '../core/middlewares/JwtAuthenticationMiddleware';
import { initializeEncryptCommonKeyAndIV } from '../core/utilities/EncyprtKeyManager';
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
  description: 'backend 공통 API',
  serverUrl: process.env.SERVER_URL ?? 'http://localhost',
  port: Number(process.env.PORT) || 8080,
  apiFiles: [
    path.resolve(__dirname, './api/controllers/**/*.ts'),
    path.resolve(__dirname, '../core/models/dtos/**/*.ts'),
  ],
});

/**
 * 데이터베이스 연결 초기화 (TypeORM)
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
  .then(() => logger.info('공통 암/복호화 키 초기화 완료'))
  .catch((error: any) => {
    logger.error('공통 암/복호화 키 초기화 중 에러 발생', error);
    process.exit(1);
  });

app.use(cookieParser());

/**
 * 헬스 체크용 API입니다.
 *
 * @route GET /health
 * @returns { status: 'OK' }
 */
app.get('/health', (request: Request, response: Response) =>
  response.json({ status: 'OK' })
);

/**
 * Express 애플리케이션 인스턴스를 export 합니다.
 * 서버 실행은 별도의 server.ts에서 수행합니다.
 */
export default app;
