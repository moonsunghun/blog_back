import { BlogCommentReply } from '../../../../entities/BlogCommentReply';

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogCommentReplyUpdateDto:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: 답글 내용 (5자 이상 100자 이하)
 *           example: "답글을 잘 못 달아 수정했습니다."
 */
export class BlogCommentReplyUpdateDto {
  blogCommentId!: number;
  blogCommentReplyId!: number;
  content!: string;

  constructor(data?: Partial<BlogCommentReplyUpdateDto>) {
    if (data) {
      if (data.blogCommentId !== undefined) {
        this.blogCommentId = data.blogCommentId;
      }

      if (data.blogCommentReplyId !== undefined) {
        this.blogCommentReplyId = data.blogCommentReplyId;
      }

      if (data.content !== undefined) {
        this.content = data.content;
      }
    }
  }

  toEntity(
    blogCommentReply: BlogCommentReply,
    blogCommentReplyUpdateDto: BlogCommentReplyUpdateDto
  ): BlogCommentReply {
    blogCommentReply.content = blogCommentReplyUpdateDto.content;

    return blogCommentReply;
  }
}
