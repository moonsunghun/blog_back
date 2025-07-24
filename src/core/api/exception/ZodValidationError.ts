import { logger } from '../../utilities/Logger';

/**
 * Zod 유효성 검사 실패 시 발생하는 예외 클래스입니다.
 *
 * 이 클래스는 Zod 스키마 검증 과정에서 오류가 발생했을 때
 * 예외 처리를 통일된 형태로 하기 위해 사용됩니다.
 *
 * 주요 특징:
 * - HTTP 상태 코드는 400(Bad Request)로 고정됩니다.
 * - 예외 발생 시 자동으로 로그가 출력됩니다.
 *
 * @example
 * throw new ZodValidationError("요청 데이터가 유효하지 않습니다.");
 */
export class ZodValidationError extends Error {
  public readonly statusCode: number = 400;

  /**
   * ZodValidationError 생성자
   *
   * @param message - 예외 메시지
   */
  constructor(message: string) {
    super(message);

    this.name = 'ZodValidationError';
    this.message = message;

    logger.error(`[ZodValidationError] ${message}`);

    // instanceof 체크를 위한 명시적 프로토타입 설정
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
