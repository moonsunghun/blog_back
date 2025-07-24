/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryFileResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 42
 *         path:
 *           type: string
 *           example: "/storage/images/12345.png"
 *         originalName:
 *           type: string
 *           example: "profile.png"
 */
export class InquiryFileResponseDto {
  readonly id!: number;
  readonly path!: string;
  readonly originalName!: string;

  constructor(partial: Partial<InquiryFileResponseDto>) {
    Object.assign(this, partial);
  }
}
