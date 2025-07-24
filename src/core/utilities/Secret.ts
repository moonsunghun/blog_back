import { logger } from './Logger';

/**
 * CORS 설정을 정의한 옵션 객체입니다.
 *
 * @property {(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => void} origin
 * - CORS 요청의 Origin을 검사하여 허용 여부를 판단합니다.
 * - 아래와 같은 경우에만 요청을 허용합니다:
 *   1. Origin 헤더가 없는 경우 (예: Postman, Curl 등) → 허용
 *   2. localhost 패턴 (예: http://localhost:3000) → 허용
 *   3. 사전에 정의된 허용 도메인 목록에 포함된 경우 → 허용
 *   4. 위 조건에 해당하지 않으면 요청 차단 및 에러 반환
 *
 * @property {boolean} credentials
 * - 인증 정보를 포함한 요청을 허용할지 여부를 나타냅니다.
 * - `true`로 설정되어 있어 쿠키 등의 자격 증명이 포함된 요청을 허용합니다.
 *
 * @description
 * Express 애플리케이션에서 `cors` 미들웨어에 전달할 수 있는 옵션 객체입니다.
 * 로컬 개발 환경을 포함하여 제한된 Origin만 허용하도록 구성되어 있으며,
 * 인증이 필요한 프론트엔드 요청(Credentials 포함)도 처리할 수 있도록 구성되어 있습니다.
 *
 * @example
 * import cors from 'cors';
 * import { corsOptions } from './config/corsOptions';
 *
 * app.use(cors(corsOptions));
 */
export const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void
  ) => {
    if (!origin) {
      logger.warn(
        `[CORS] Origin 없음 - 요청 프로그램에서 Origin 헤더를 보내지 않음 (Postman, Curl 등)`
      );

      return callback(null, true);
    }

    logger.info(`[CORS] 요청 Origin: ${origin}`);

    const localhostRegex = /^http:\/\/localhost:\d{1,5}$/;
    if (localhostRegex.test(origin)) {
      logger.info(`[CORS] localhost 요청 허용: ${origin}`);
      return callback(null, true);
    }

    logger.info(`추가 허용 도메인 검사`);

    const allowedDomains = ['http://127.0.0.1', 'https://localhost', 'https://127.0.0.1'];

    if (allowedDomains.includes(origin)) {
      logger.info(`[CORS] 허용된 도메인 목록에 포함된 origin 허용: ${origin}`);

      return callback(null, true);
    }

    logger.error(`[CORS] 허용되지 않은 Origin 차단: ${origin}`);

    return callback(new Error(`허용되지 않은 CORS 요청: ${origin}`));
  },

  credentials: true,
};
