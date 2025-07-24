import { HttpExceptionResponse } from '../api/exception/HttpExceptionResponse';
import { ZodValidationError } from '../api/exception/ZodValidationError';
import { logger } from '../utilities/Logger';

/**
 * 공통 예외 응답 포맷터
 *
 * 컨트롤러에서 발생한 예외를 HTTP 응답용 객체로 변환합니다.
 * `HttpExceptionResponse` 또는 `ZodValidationError`와 같은 커스텀 예외 객체인 경우,
 * 해당 예외의 `statusCode`와 `message`를 응답에 사용하며,
 * 그렇지 않은 경우 기본값인 500과 전달받은 메시지를 반환합니다.
 *
 * @param error - 처리할 예외 객체
 * @param errorMessage - 기본 예외 메시지 (일반 에러 또는 디폴트 응답용 메시지)
 * @returns HTTP 응답용 예외 객체 `{ statusCode, message }`
 *
 * @example
 * try {
 *   // some logic...
 * } catch (error) {
 *   return res.status(500).json(CommonExceptionControllerResponseProcessor(error, '알 수 없는 오류가 발생했습니다.'));
 * }
 */
export const commonExceptionControllerResponseProcessor = (error: any, errorMessage: string) => {
  let statusCode: number = 500;

  if (error instanceof HttpExceptionResponse || error instanceof ZodValidationError) {
    statusCode = error.statusCode;
  }

  logger.error(`${errorMessage} 문제 내용 - ${error.message}`);

  return {
    statusCode,
    errorMessage,
  };
};
