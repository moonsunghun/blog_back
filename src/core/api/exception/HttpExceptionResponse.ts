import { logger } from '../../utilities/Logger';

/**
 * HTTP 예외 응답을 처리하기 위한 커스텀 에러 클래스입니다.
 *
 * 이 클래스는 서비스 로직 중 HTTP 상태 코드와 메시지를 함께 반환하고자 할 때 사용됩니다.
 * 일반적인 Error 객체를 확장하여 `statusCode`를 추가로 제공합니다.
 *
 * 주요 필드:
 * - statusCode: HTTP 응답 코드 (예: 400, 404, 500 등)
 * - message: 예외 메시지
 *
 * 주요 메서드:
 * - constructor: 상태 코드와 메시지를 받아 예외 객체를 생성합니다.
 *
 * 주의사항:
 * - `Error`를 상속하지만 `Object.setPrototypeOf`으로 명시적 프로토타입 설정을 해야 instanceof 체크가 정확히 동작합니다.
 */
export class HttpExceptionResponse extends Error {
  statusCode: number;

  /**
   * 커스텀 예외 객체 생성자
   *
   * @param statusCode - HTTP 상태 코드
   * @param message - 예외 메시지
   */
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    logger.error(message);

    Object.setPrototypeOf(this, HttpExceptionResponse.prototype);
  }
}
