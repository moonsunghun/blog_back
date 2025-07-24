import { BlogComment } from '../../../../entities/BlogComment';

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogCommentListResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: "댓글 ID"
 *           example: 34
 *         blogId:
 *           type: integer
 *           description: "게시글 ID"
 *           example: 34
 *         content:
 *           type: string
 *           description: "댓글 내용"
 *           example: "해당 이슈는 수정 완료되었습니다."
 */
export class BlogCommentListResponseDto {
  readonly id!: number;
  readonly blogId!: number;
  // todo 작성자 처리 필요
  readonly userId!: number;
  readonly createDateTime!: Date;
  readonly content!: string;

  constructor(blogComment: BlogComment) {
    this.id = blogComment.id;
    this.blogId = blogComment.blog.id;
    this.userId = blogComment.userId;
    this.createDateTime = blogComment.createDateTime;
    this.content = blogComment.content;
  }
}
