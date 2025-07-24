/**
 * API 응답의 공통 구조를 정의하는 제네릭 클래스입니다.
 *
 * 이 클래스는 상태 코드, 메시지, 페이징 정보, 응답 데이터를 포함할 수 있으며,
 * 정적 팩토리 메서드를 통해 다양한 응답 패턴을 쉽게 생성할 수 있도록 구성되어 있습니다.
 *
 * 주요 필드:
 * - statusCode: 응답 상태 코드 (예: 200, 400, 500)
 * - message: 응답 메시지
 * - pagination: 페이징 정보 객체 (Page<T>)
 * - data: 실제 반환 데이터 (제네릭)
 *
 * 주요 메서드:
 * - response: 데이터 없이 상태 코드와 메시지만 반환
 * - responseWithData: 데이터 포함 응답 반환
 * - responseWithPaginationAndData: 페이징 정보 포함 응답 반환
 *
 * 주의사항:
 * - Swagger 문서에서는 `oneOf`를 활용하여 단일 객체 또는 배열 모두 지원되도록 명시됨
 */

import { Page } from './Page';

/**
 * @swagger
 * components:
 *   schemas:
 *     DefaultResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           description: 응답 상태 코드
 *           example: 200
 *         message:
 *           type: string
 *           description: 응답 메시지
 *           example: "요청이 성공적으로 처리되었습니다."
 *         pagination:
 *           $ref: '#/components/schemas/Page'
 *         data:
 *           description: 제네릭 응답 데이터
 *           oneOf:
 *             - type: object
 *             - type: array
 */
export class DefaultResponse<T> {
  /**
   * HTTP 응답 코드입니다.
   * @example 200
   */
  statusCode!: number;

  /**
   * 사용자에게 전달될 메시지입니다.
   * @example "요청이 성공적으로 처리되었습니다."
   */
  message!: string;

  /**
   * 페이징 응답이 필요한 경우에만 포함됩니다.
   */
  pagination?: Page<T>;

  /**
   * 실제 응답 데이터입니다.
   * 단일 객체 또는 배열 형태 모두 가능
   */
  data?: T;

  constructor(statusCode: number, message: string, pagination?: Page<T>, data?: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.pagination = pagination;
    this.data = data;
  }

  /**
   * 데이터 없이 응답 코드와 메시지만 포함된 기본 응답을 생성합니다.
   *
   * @param statusCode 응답 코드
   * @param message 응답 메시지
   */
  static response<T>(statusCode: number, message: string): DefaultResponse<T> {
    return new DefaultResponse<T>(statusCode, message);
  }

  /**
   * 데이터만 포함된 응답을 생성합니다.
   *
   * @param statusCode 응답 코드
   * @param message 응답 메시지
   * @param data 반환할 실제 데이터
   */
  static responseWithData<T>(statusCode: number, message: string, data: T): DefaultResponse<T> {
    return new DefaultResponse<T>(statusCode, message, undefined, data);
  }

  /**
   * 페이징 정보가 포함된 응답을 생성합니다.
   *
   * @param statusCode 응답 코드
   * @param message 응답 메시지
   * @param pagination 페이징 객체
   */
  static responseWithPaginationAndData<T>(
    statusCode: number,
    message: string,
    pagination: Page<T>
  ): DefaultResponse<T> {
    return new DefaultResponse<T>(statusCode, message, pagination, undefined);
  }
}
