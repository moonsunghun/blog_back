/**
 * HTTP 요청 로그를 기록하는 morgan 미들웨어입니다.
 *
 * 이 미들웨어는 요청 정보를 로그로 출력하며, 내부적으로 winston 로거와 연동되어
 * 로그 메시지를 `logger.http()` 메서드를 통해 기록합니다.
 *
 * 주요 포맷:
 * - `:method :url :status :response[content-length] - :response-time ms`
 *   예시: `GET /api/user 200 123 - 5.678 ms`
 *
 * 주요 기능:
 * - 로깅 스트림: Winston 로거의 HTTP 레벨로 메시지 전달
 * - 로컬 환경(`NODE_ENV === 'local'`)에서는 로그 생략
 *
 * 주의사항:
 * - 로컬 개발 시 중복 로그 방지를 위해 `skip()` 조건이 활성화됩니다.
 * - 로그 메시지는 `Logger.ts`에서 정의한 HTTP 레벨 로그에 기록됩니다.
 */
import { logger } from '../utilities/Logger';
import morgan from 'morgan';

/**
 * morgan 로그 메시지를 winston의 logger.http()로 전달하기 위한 스트림입니다.
 *
 * @param message morgan이 생성한 로그 메시지 (개행 포함)
 */
const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

/**
 * 로컬 개발 환경 여부를 확인하여 로깅을 건너뛸지 결정합니다.
 *
 * @returns boolean - true인 경우 morgan 로그 생략
 */
const skip = () => {
  return process.env.NODE_ENV === 'local';
};

/**
 * Express에서 사용할 수 있는 morgan 미들웨어입니다.
 *
 * @returns Express-compatible logging middleware
 */
export const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);
