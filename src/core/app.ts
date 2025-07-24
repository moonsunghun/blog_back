/**
 * 최소 구성의 Express 애플리케이션입니다.
 *
 * 이 앱은 JSON 요청 파싱 및 헬스 체크 엔드포인트만 제공하며,
 * 테스트, 모듈화된 서비스, 혹은 경량 API 구성에 적합합니다.
 *
 * 주요 기능:
 * - express.json()을 통한 JSON 요청 본문 파싱
 * - /health 헬스 체크 API 제공
 *
 * 주의사항:
 * - 서버는 실제로 실행되지 않으며, 외부에서 app.listen()으로 실행해야 합니다.
 */

import type { Request, Response } from 'express';
import express from 'express';
import 'reflect-metadata';

const app = express();

/**
 * 헬스 체크용 엔드포인트입니다.
 *
 * @route GET /health
 * @returns { status: 'OK' }
 */
app.get('/health', (request: Request, response: Response) => response.json({ status: 'OK' }));

/**
 * Express 애플리케이션 인스턴스를 외부로 export 합니다.
 */
export default app;
