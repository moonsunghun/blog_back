import { InquiryFileUpdateResponseDto } from './InquiryFileUpdateResponseDto';

/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryUpdateResponseDto:
 *       type: object
 *       properties:
 *         inquiryId:
 *           type: integer
 *           description: "수정된 문의글 ID"
 *           example: 1
 *         files:
 *           type: array
 *           description: "수정 후 남아있는 파일 목록"
 *           items:
 *             $ref: '#/components/schemas/InquiryFileUpdateResponseDto'
 */
export class InquiryUpdateResponseDto {
  readonly inquiryId!: number;
  readonly files?: InquiryFileUpdateResponseDto[];

  constructor(inquiryId: number, files: InquiryFileUpdateResponseDto[]) {
    this.inquiryId = inquiryId;
    this.files = files;
  }
}
