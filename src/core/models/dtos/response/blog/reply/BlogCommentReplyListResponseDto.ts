import { BlogCommentReply } from '../../../../entities/BlogCommentReply';

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogCommentReplyListResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: "답글 ID"
 *           example: 34
 *         blogCommentId:
 *           type: integer
 *           description: "댓글 ID"
 *           example: 34
 *         content:
 *           type: string
 *           description: "답글 내용"
 *           example: "아직 동일 문제가 발생하는데, 다시 한번 확인해 주실 수 있으실까요?"
 */
export class BlogCommentReplyListResponseDto {
  readonly id!: number;
  readonly blogCommentId!: number;
  // todo 작성자 처리 필요
  readonly writer!: string;
  readonly createDateTime!: Date;
  readonly content!: string;

  constructor(blogCommentReply: BlogCommentReply) {
    this.id = blogCommentReply.id;
    this.blogCommentId = blogCommentReply.blogComment.id;
    this.createDateTime = blogCommentReply.createDateTime;
    this.content = blogCommentReply.content;
  }
}
