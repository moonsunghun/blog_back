import { BlogComment } from '../../../../entities/BlogComment';

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogCommentUpdateRequestDto:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: 댓글 내용 (5자 이상 100자 이하)
 *           example: "댓글을 잘 못 달아 수정했습니다."
 */
export class BlogCommentUpdateRequestDto {
  blogId!: number;
  blogCommentId!: number;
  content!: string;

  constructor(data?: Partial<BlogCommentUpdateRequestDto>) {
    if (data) {
      if (data.blogId !== undefined) {
        this.blogId = data.blogId;
      }

      if (data.blogCommentId !== undefined) {
        this.blogCommentId = data.blogCommentId;
      }

      if (data.content !== undefined) {
        this.content = data.content;
      }
    }
  }

  toEntity(
    blogComment: BlogComment,
    blogCommentUpdateDto: BlogCommentUpdateRequestDto
  ): BlogComment {
    blogComment.content = blogCommentUpdateDto.content;

    return blogComment;
  }
}
