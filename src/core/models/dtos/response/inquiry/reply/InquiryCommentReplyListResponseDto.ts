import { InquiryCommentReply } from '../../../../entities/InquiryCommentReply';

/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryCommentReplyListResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 답글 고유 ID
 *           example: 301
 *         inquiryCommentId:
 *           type: integer
 *           description: 해당 답글이 속한 댓글 ID
 *           example: 201
 *         writer:
 *           type: string
 *           description: 답글 작성자 닉네임 (회원 또는 비회원 UUID 앞 4자리)
 *           example: "efgh"
 *         createDateTime:
 *           type: string
 *           format: date-time
 *           description: 답글 생성 시각
 *           example: "2025-07-13T16:00:00.000Z"
 *         updateDateTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 답글 수정 시각 (수정 이력이 없으면 null)
 *           example: "2025-07-13T16:30:00.000Z"
 *         content:
 *           type: string
 *           description: 답글 내용
 *           example: "좋은 의견 감사합니다."
 */
export class InquiryCommentReplyListResponseDto {
  readonly id!: number;
  readonly inquiryCommentId!: number;
  readonly writer!: string | null;
  readonly createDateTime!: Date;
  readonly updateDateTime?: Date;
  readonly content!: string;

  constructor(inquiryCommentReply: InquiryCommentReply) {
    this.id = inquiryCommentReply.id;
    this.inquiryCommentId = inquiryCommentReply.inquiryComment.id;
    this.writer = this.getWriter(inquiryCommentReply);
    this.createDateTime = inquiryCommentReply.createDateTime;
    this.updateDateTime = inquiryCommentReply.updateDateTime;
    this.content = inquiryCommentReply.content;
  }

  /**
   * 답글 작성자의 닉네임을 반환합니다.
   *
   * @param {InquiryCommentReply} inquiryCommentReply - 작성자 정보를 포함한 답글 엔티티
   * @returns {string | null} 작성자의 닉네임 (회원 또는 비회원), 없을 경우 null
   *
   * @description
   * - 작성자가 회원이면 `user.nickName`을 반환합니다.
   * - 비회원일 경우 `guestNickName`을 반환합니다.
   * - 두 경우 모두 존재하지 않으면 예외를 발생시킵니다.
   * - `inquiryCommentReply`가 null 이거나 undefined일 경우 null을 반환합니다.
   */
  private getWriter(inquiryCommentReply: InquiryCommentReply): string | null {
    if (!inquiryCommentReply) {
      return null;
    } else if (inquiryCommentReply.user?.nickName != null) {
      return inquiryCommentReply.user?.nickName;
    } else if (inquiryCommentReply.guestNickName) {
      return inquiryCommentReply.guestNickName;
    } else {
      throw new Error('데이터 베이스에 문의 게시글 댓글의 답글 작성자 정보가 없는 문제 발생');
    }
  }
}
