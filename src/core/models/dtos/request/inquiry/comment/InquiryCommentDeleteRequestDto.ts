/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryCommentDeleteRequestDto:
 *       type: object
 *       required:
 *         - inquiryId
 *         - inquiryCommentId
 *       properties:
 *         inquiryId:
 *           type: integer
 *           description: 댓글이 속한 문의 게시글 ID
 *           example: 1
 *         inquiryCommentId:
 *           type: integer
 *           description: 삭제할 댓글 ID
 *           example: 42
 */
export class InquiryCommentDeleteRequestDto {
  inquiryId!: number;
  inquiryCommentId!: number;

  constructor(data?: Partial<InquiryCommentDeleteRequestDto>) {
    if (data) {
      if (data.inquiryId !== undefined) {
        this.inquiryId = data.inquiryId;
      }

      if (data.inquiryCommentId !== undefined) {
        this.inquiryCommentId = data.inquiryCommentId;
      }
    }
  }
}
