import { Blog } from '../../../../entities/Blog';
import { BlogComment } from '../../../../entities/BlogComment';

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogCommentCreateRequestDto:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: 댓글 내용 (5자 이상 100자 이하)
 *           example: "해당 문의에 대한 답변입니다."
 */
export class BlogCommentCreateRequestDto {
  content!: string;
  userId!: number;

  constructor(data?: Partial<BlogCommentCreateRequestDto>) {
    if (data) {
      if (data.content !== undefined) {
        this.content = data.content;
      }
      if (data.userId !== undefined) {
        this.userId = data.userId;
      }
    }
  }

  toEntity(blog: Blog, blogCommentRegisterDto: BlogCommentCreateRequestDto) {
    const blogComment = new BlogComment();

    blogComment.content = blogCommentRegisterDto.content;
    blogComment.userId = blogCommentRegisterDto.userId;
    blogComment.blog = blog;

    return blogComment;
  }
}
