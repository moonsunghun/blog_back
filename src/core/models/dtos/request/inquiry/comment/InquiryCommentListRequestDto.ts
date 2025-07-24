import { PageRequestDto } from '../../PageRequestDto';

/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryCommentListRequestDto:
 *       allOf:
 *         - $ref: '#/components/schemas/PageRequestDto'
 *         - type: object
 *           properties:
 *             inquiryId:
 *               type: integer
 *               description: 댓글을 조회할 문의 게시글 ID
 *               example: 1
 */
export class InquiryCommentListRequestDto extends PageRequestDto {
  inquiryId!: number;

  constructor(data?: Partial<InquiryCommentListRequestDto>) {
    super(data);

    if (data) {
      if (data.inquiryId !== undefined) {
        this.inquiryId = data.inquiryId;
      }
    }
  }
}
