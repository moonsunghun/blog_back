/**
 * 페이징 응답 데이터를 구성하는 공통 클래스입니다.
 *
 * API 목록 응답에서 페이징 정보를 포함할 때 사용되며,
 * 전체 개수, 현재 페이지, 총 페이지 수, 데이터 배열 등을 포함합니다.
 *
 * 주요 필드:
 * - perPageSize: 한 페이지당 항목 수
 * - totalCount: 전체 항목 수
 * - totalPage: 전체 페이지 수 (자동 계산)
 * - data: 실제 데이터 배열 (제네릭 타입 T)
 *
 * 주요 메서드:
 * - toString(): 디버깅용 문자열 반환
 *
 * 주의사항:
 * - 페이지 계산은 Math.ceil을 기반으로 하며, 최소 페이지 수는 1입니다.
 */

import { logger } from '../utilities/Logger';

/**
 * @swagger
 * components:
 *   schemas:
 *     Page:
 *       type: object
 *       properties:
 *         totalCount:
 *           type: integer
 *           example: 100
 *         currentPage:
 *           type: integer
 *           example: 1
 *         totalPages:
 *           type: integer
 *           example: 10
 *         perPageSize:
 *           type: integer
 *           example: 10
 *         data:
 *           type: array
 *           items:
 *             type: object
 */
export class Page<T> {
  /**
   * 현재 페이지
   *
   * @example 1
   */
  currentPage: number;

  /**
   * 한 페이지에 표시할 항목 수
   *
   * @example 10
   */
  perPageSize: number;

  /**
   * 전체 항목 수
   *
   * @example 100
   */
  totalCount: number;

  /**
   * 전체 페이지 수 (자동 계산됨)
   *
   * @example 10
   */
  totalPage: number;

  /**
   * 실제 데이터 목록
   */
  data: T[];

  /**
   * Page 객체를 생성합니다.
   *
   * @param currentPage 현재 페이지
   * @param perPageSize 한 페이지당 항목 수
   * @param totalCount 전체 항목 수
   * @param results 실제 데이터 배열
   */
  constructor(currentPage: number, perPageSize: number, totalCount: number, results: T[]) {
    this.currentPage = currentPage;
    this.perPageSize = perPageSize;
    this.totalCount = totalCount;

    const calculatedPage: number = Math.ceil(totalCount / perPageSize);

    // 총 페이지 수 계산
    if (calculatedPage < 1) {
      logger.warn(`페이징 계산 중 총 페이지 개수가 1보다 작은 결과로 인해 1로 강제 적용`);

      this.totalPage = 1;
    } else {
      this.totalPage = calculatedPage;
    }

    // 현재 페이지 유효성 보정
    if (currentPage < 1) {
      this.currentPage = 1;
    } else if (currentPage > this.totalPage) {
      this.currentPage = this.totalPage;
    } else {
      this.currentPage = currentPage;
    }

    this.data = results;
  }

  /**
   * 디버깅을 위한 문자열 표현을 반환합니다.
   *
   * @returns 페이지 정보를 포함한 문자열
   */
  toString(): string {
    return `Page(perPageSize=${this.perPageSize}, currentPage=${this.currentPage}, totalCount=${this.totalCount}, totalPage=${this.totalPage}, data=${JSON.stringify(this.data, null, 2)})`;
  }
}
