import { InquiryComment } from '../../../../entities/InquiryComment';

/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryCommentUpdateRequestDto:
 *       type: object
 *       required:
 *         - inquiryId
 *         - inquiryCommentId
 *         - content
 *       properties:
 *         inquiryId:
 *           type: integer
 *           description: 댓글이 속한 문의 게시글 ID
 *           example: 1
 *         inquiryCommentId:
 *           type: integer
 *           description: 수정할 댓글의 고유 ID
 *           example: 10
 *         content:
 *           type: string
 *           description: 수정할 댓글 내용
 *           example: "댓글 내용을 수정했습니다."
 */
export class InquiryCommentUpdateRequestDto {
  inquiryId!: number;
  inquiryCommentId!: number;
  content!: string;

  constructor(data?: Partial<InquiryCommentUpdateRequestDto>) {
    if (data) {
      if (data.inquiryId !== undefined) {
        this.inquiryId = data.inquiryId;
      }

      if (data.inquiryCommentId !== undefined) {
        this.inquiryCommentId = data.inquiryCommentId;
      }

      if (data.content !== undefined) {
        this.content = data.content;
      }
    }
  }

  toEntity(
    inquiryComment: InquiryComment,
    inquiryCommentUpdateDto: InquiryCommentUpdateRequestDto
  ): InquiryComment {
    inquiryComment.updateDateTime = new Date();
    inquiryComment.content = inquiryCommentUpdateDto.content;

    return inquiryComment;
  }
}
