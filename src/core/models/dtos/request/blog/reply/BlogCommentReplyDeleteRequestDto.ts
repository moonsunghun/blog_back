/**
 * @swagger
 * components:
 *   schemas:
 *     BlogCommentReplyDeleteRequestDto:
 *       type: object
 *       required:
 *         - blogCommentId
 *         - blogCommentReplyId
 *       properties:
 *         blogCommentId:
 *           type: integer
 *           description: "답글이 속한 블로그 게시글 댓글 ID"
 *           example: 2
 *         blogCommentReplyId:
 *           type: integer
 *           description: "삭제할 답글 ID"
 *           example: 1
 */
export class BlogCommentReplyDeleteRequestDto {
  blogCommentId!: number;
  blogCommentReplyId!: number;

  constructor(data?: Partial<BlogCommentReplyDeleteRequestDto>) {
    if (data) {
      if (data.blogCommentId !== undefined) {
        this.blogCommentId = data.blogCommentId;
      }

      if (data.blogCommentReplyId !== undefined) {
        this.blogCommentReplyId = data.blogCommentReplyId;
      }
    }
  }
}
