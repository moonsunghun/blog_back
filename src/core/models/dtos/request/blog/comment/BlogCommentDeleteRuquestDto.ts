/**
 * @swagger
 * components:
 *   schemas:
 *     BlogCommentDeleteRequestDto:
 *       type: object
 *       required:
 *         - blogId
 *         - blogCommentId
 *       properties:
 *         blogId:
 *           type: integer
 *           description: "댓글이 속한 블로그 게시글 ID"
 *           example: 2
 *         blogCommentId:
 *           type: integer
 *           description: "삭제할 댓글 ID"
 *           example: 1
 */
export class BlogCommentDeleteRequestDto {
  blogId!: number;
  blogCommentId!: number;

  constructor(data?: Partial<BlogCommentDeleteRequestDto>) {
    if (data) {
      if (data.blogId !== undefined) {
        this.blogId = data.blogId;
      }

      if (data.blogCommentId !== undefined) {
        this.blogCommentId = data.blogCommentId;
      }
    }
  }
}
