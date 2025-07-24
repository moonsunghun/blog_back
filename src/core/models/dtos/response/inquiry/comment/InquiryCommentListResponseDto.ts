import { InquiryComment } from '../../../../entities/InquiryComment';

/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryCommentListResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 댓글 고유 ID
 *           example: 101
 *         inquiryId:
 *           type: integer
 *           description: 댓글이 작성된 문의 게시글 ID
 *           example: 1
 *         writer:
 *           type: string
 *           description: 댓글 작성자 닉네임 (회원 or 비회원 UUID 앞 4자리)
 *           example: "abcd"
 *         createDateTime:
 *           type: string
 *           format: date-time
 *           description: 댓글 생성 시각
 *           example: "2025-07-13T15:25:00.000Z"
 *         updateDateTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 댓글 수정 시각 (수정 이력이 없으면 null)
 *           example: "2025-07-13T15:45:00.000Z"
 *         content:
 *           type: string
 *           description: 댓글 내용
 *           example: "저도 같은 문제를 겪고 있습니다."
 */
export class InquiryCommentListResponseDto {
  readonly id!: number;
  readonly inquiryId!: number;
  readonly writer!: string | null;
  readonly createDateTime!: Date;
  readonly updateDateTime?: Date;
  readonly content!: string;

  constructor(inquiryComment: InquiryComment) {
    this.id = inquiryComment.id;
    this.inquiryId = inquiryComment.inquiry.id;
    this.writer = this.getWriter(inquiryComment);
    this.createDateTime = inquiryComment.createDateTime;
    this.updateDateTime = inquiryComment.updateDateTime;
    this.content = inquiryComment.content;
  }

  /**
   * 댓글 작성자의 닉네임을 반환합니다.
   *
   * @param {InquiryComment} inquiryComment - 작성자 정보를 포함한 댓글 엔티티
   * @returns {string | null} 작성자의 닉네임 (회원 또는 비회원), 없을 경우 null
   *
   * @description
   * - 작성자가 회원이면 `user.nickName`을 반환합니다.
   * - 비회원일 경우 `guestNickName`을 반환합니다.
   * - 두 경우 모두 존재하지 않으면 예외를 발생시킵니다.
   * - `inquiryCommentReply`가 null 이거나 undefined일 경우 null을 반환합니다.
   */
  private getWriter(inquiryComment: InquiryComment): string | null {
    if (!inquiryComment) {
      return null;
    } else if (inquiryComment.user?.nickName != null) {
      return inquiryComment.user?.nickName;
    } else if (inquiryComment.guestNickName) {
      return inquiryComment.guestNickName;
    } else {
      throw new Error('데이터 베이스에 문의 게시글 댓글 작성자 정보가 없는 문제 발생');
    }
  }
}
