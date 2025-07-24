/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryCommentReplyDeleteRequestDto:
 *       type: object
 *       required:
 *         - inquiryCommentId
 *         - inquiryCommentReplyId
 *       properties:
 *         inquiryCommentId:
 *           type: integer
 *           description: 댓글 답글이 속한 부모 댓글 ID
 *           example: 5
 *         inquiryCommentReplyId:
 *           type: integer
 *           description: 삭제할 댓글 답글의 ID
 *           example: 13
 */
export class InquiryCommentReplyDeleteRequestDto {
  inquiryCommentId!: number;
  inquiryCommentReplyId!: number;

  constructor(data?: Partial<InquiryCommentReplyDeleteRequestDto>) {
    if (data) {
      if (data.inquiryCommentId !== undefined) {
        this.inquiryCommentId = data.inquiryCommentId;
      }

      if (data.inquiryCommentReplyId !== undefined) {
        this.inquiryCommentReplyId = data.inquiryCommentReplyId;
      }
    }
  }
}
