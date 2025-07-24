/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryDetailSearchRequestDto:
 *       type: object
 *       required:
 *         - inquiryId
 *       properties:
 *         inquiryId:
 *           type: integer
 *           description: 상세 조회할 문의 게시글 ID
 *           example: 101
 *         processType:
 *           type: boolean
 *           description: 내부 로직 처리 플래그 (true 작성자 검증 포함)
 *           example: false
 */
export class InquiryDetailSearchRequestDto {
  inquiryId!: number;
  processType?: boolean = false;

  constructor(data?: {
    inquiryId?: string;
    validateGuestPassword?: string | boolean;
    processType?: string | boolean;
  }) {
    if (data) {
      if (data.inquiryId !== undefined) {
        this.inquiryId = Number(data.inquiryId);
      }

      if (data.processType !== undefined) {
        this.processType =
          typeof data.processType === 'string'
            ? data.processType === 'true'
            : Boolean(data.processType);
      }
    }
  }
}
