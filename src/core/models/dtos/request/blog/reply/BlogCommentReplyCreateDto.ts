import { BlogComment } from '../../../../entities/BlogComment';
import { BlogCommentReply } from '../../../../entities/BlogCommentReply';

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogCommentReplyCreateDto:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: "답글 내용 (5자 이상 100자 이하)"
 *           example: "저도 동일한 이슈가 있어요. 확인 부탁드립니다."
 */
export class BlogCommentReplyCreateDto {
  content!: string;
  userId!: number;

  constructor(data?: Partial<BlogCommentReplyCreateDto>) {
    if (data) {
      if (data.content !== undefined) {
        this.content = data.content;
      }
      if (data.userId !== undefined) {
        this.userId = data.userId;
      }
    }
  }

  toEntity(blogComment: BlogComment, blogCommentReplyCreateRequestDto: BlogCommentReplyCreateDto) {
    const blogCommentReply = new BlogCommentReply();

    blogCommentReply.content = blogCommentReplyCreateRequestDto.content;
    blogCommentReply.blogComment = blogComment;
    blogCommentReply.userId = blogCommentReplyCreateRequestDto.userId;
    return blogCommentReply;
  }
}
