import { OrderBy } from '../../../types/Enum';

/**
 * @swagger
 * components:
 *   schemas:
 *     PageRequestDto:
 *       type: object
 *       properties:
 *         pageNumber:
 *           type: integer
 *           example: 1
 *           description: "페이지 번호 (기본값: 1)"
 *         perPageSize:
 *           type: integer
 *           example: 10
 *           description: "페이지당 항목 수 (기본값: 10)"
 *         orderBy:
 *           type: string
 *           enum: [ASC, DESC]
 *           example: "DESC"
 *           description: 정렬 방향
 */
export class PageRequestDto {
  pageNumber: number = 1;
  perPageSize: number = 10;
  orderBy: OrderBy = OrderBy.DESC;

  constructor(data?: Partial<PageRequestDto>) {
    if (data) {
      if (data.pageNumber !== undefined) {
        this.pageNumber = data.pageNumber;
      }

      if (data.perPageSize !== undefined) {
        this.perPageSize = data.perPageSize;
      }

      if (data.orderBy !== undefined) {
        this.orderBy = data.orderBy;
      }
    }
  }

  /**
   * 현재 페이지에 대한 오프셋(offset)을 반환합니다.
   *
   * 데이터베이스에서 페이지네이션 쿼리를 수행할 때 사용되며,
   * `(pageNumber - 1) * perPageSize` 공식을 기반으로 계산됩니다.
   *
   * @returns 조회 시작 위치(0부터 시작하는 인덱스)
   */
  getOffset(): number {
    return (this.pageNumber - 1) * this.perPageSize;
  }

  /**
   * 한 페이지당 조회할 데이터의 최대 개수(limit)를 반환합니다.
   *
   * 페이지네이션 쿼리에서 `LIMIT` 절에 사용됩니다.
   *
   * @returns 페이지 크기 (perPageSize)
   */
  getLimit(): number {
    return this.perPageSize;
  }
}
