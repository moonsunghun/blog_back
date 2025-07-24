import { InquiryFileResponseDto } from './InquiryFileResponseDto';

/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryCreateResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         files:
 *           type: array
 *           description: "List of uploaded file(s)"
 *           items:
 *             $ref: '#/components/schemas/InquiryFileSummaryDto'
 */
export class InquiryCreateResponseDto {
  readonly inquiryId!: number;
  readonly files?: InquiryFileResponseDto[];

  constructor(inquiryId: number, files: InquiryFileResponseDto[]) {
    this.inquiryId = inquiryId;
    this.files = files;
  }
}
