import { DefaultSearchOrderColumn } from '../../../../../types/Enum';
import { PageRequestDto } from '../../PageRequestDto';

/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryCommentReplyListRequestDto:
 *       allOf:
 *         - $ref: '#/components/schemas/PageRequestDto'
 *         - type: object
 *           properties:
 *             inquiryId:
 *               type: integer
 *               description: 답글을 조회할 문의 게시글 댓글 ID
 *               example: 1
 */
export class InquiryCommentReplyListRequestDto extends PageRequestDto {
  orderColumn?: DefaultSearchOrderColumn;
  inquiryCommentId!: number;

  constructor(data?: Partial<InquiryCommentReplyListRequestDto>) {
    super(data);

    if (data) {
      if (data.inquiryCommentId !== undefined) {
        this.inquiryCommentId = data.inquiryCommentId;
      }
    }
  }
}
