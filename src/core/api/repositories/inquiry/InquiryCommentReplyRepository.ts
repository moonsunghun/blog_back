import { InquiryCommentReply } from '../../../models/entities/InquiryCommentReply';

/**
 * 문의 게시글 댓글의 답글 저장소 인터페이스입니다.
 *
 * 이 인터페이스는 InquiryCommentReply 관련 데이터베이스 연산을 정의합니다.
 * 구현체에서는 실제 저장소 로직을 정의하게 됩니다.
 *
 * 주요 기능:
 * - 댓글 저장 (save)
 * - 고유 번호를 이용한 조회 (findById)
 * - 문의 게시글의 댓글 Entity와 댓글의 답글 고유 번호를 이용한 조회 (findByInquiryCommentAndInquiryCommentReplyId)
 * - 답글 고유번호를 이용한 답글 삭제 (delectByInquiryCommentReplyId)
 */
export interface InquiryCommentReplyRepository {
  /**
   * 답글 엔티티를 저장하는 메서드입니다.
   *
   * @param inquiryCommentReply 저장할 InquiryCommentReply 엔티티
   * @returns 저장된 답글의 고유 ID
   */
  save(inquiryCommentReply: InquiryCommentReply): Promise<number>;

  /**
   * 문의 게시글 댓글과 답글 ID를 기반으로 답글을 찾습니다.
   *
   * @param inquiryCommentId 문의 게시글 댓글 ID
   * @param inquiryCommentReplyId 찾고자 하는 댓글의 답글 ID
   * @returns 일치하는 댓글 객체 또는 null (답글을 찾을 수 없는 경우).
   * @throws Error 데이터베이스 쿼리 실패 시.
   */
  findByInquiryCommentAndInquiryCommentReplyId(
    inquiryCommentId: number,
    inquiryCommentReplyId: number
  ): Promise<InquiryCommentReply | null>;

  /**
   * 주어진 ID에 해당하는 문의 게시글 댓글의 답글을 조회합니다.
   *
   * 이 메서드는 `inquiryCommentReplyId`를 기반으로 데이터베이스에서 해당 문의 게시글 댓글의 답글을 검색합니다.
   *
   * @param inquiryCommentReplyId - 조회할 문의 게시글 댓글의 답글 고유 ID
   * @returns 조회된 InquiryComment 엔티티 또는 존재하지 않을 경우 null
   *
   * 주의사항:
   * - 삭제되었거나 존재하지 않는 ID의 경우 null이 반환됩니다.
   */
  findById(inquiryCommentReplyId: number): Promise<InquiryCommentReply | null>;

  /**
   * 주어진 문의 게시글 댓글의 답글 ID를 기반으로 답글 정보와 연관된 사용자 정보를 조회합니다.
   *
   * @param {number} inquiryCommentReplyId - 조회할 문의 게시글 댓글의 답글 고유 ID
   * @returns {Promise<InquiryCommentReply | null>} 조회된 문의 게시글 댓글의 답글 엔티티 또는 존재하지 않으면 null
   *
   * @description
   * - 해당 함수는 `inquiryCommentReply` 엔티티와 `inquiryComment`, `user` 엔티티 간의 관계를 포함하여 조회합니다.
   * - 비회원이 작성한 경우, `user` 필드는 `null`일 수 있습니다.
   * - 내부적으로 TypeORM의 `relations` 옵션을 사용하여 연관 사용자 데이터를 함께 로딩합니다.
   *
   * @example
   * const inquiry = await findInquiryCommentReplyWithUserByInquiryCommentReplyId(15);
   * if (inquiryCommentReply?.user) {
   *   console.log(`작성자 이메일: ${inquiryCommentReply.user.email}`);
   * }
   */
  findInquiryCommentReplyWithUserByInquiryCommentReplyId(
    inquiryCommentReplyId: number
  ): Promise<InquiryCommentReply | null>;

  /**
   * 비회원 닉네임으로 작성된 문의글 댓글의 답글을 조회합니다.
   *
   * @param {string} guestNickName - 조회할 비회원 닉네임
   * @returns {Promise<Inquiry | null>} 해당 닉네임으로 작성된 문의글 댓글의 답글이 존재하면 InquiryCommentReply 객체, 없으면 null 반환
   *
   * @description
   * - 문의 게시글 중 주어진 `guestNickName` 을 사용한 첫 번째 게시글을 조회합니다.
   * - 비회원 중복 닉네임 검증 및 게시글 작성자 식별 등에 사용됩니다.
   *
   * @example
   * const inquiry = await this.findByGuestNickName('익명4567');
   * if (inquiry) {
   *   console.log('이미 사용 중인 닉네임입니다.');
   * }
   */
  findByGuestNickName(guestNickName: string): Promise<InquiryCommentReply | null>;

  /**
   * 특정 ID를 가진 답글을 삭제합니다.
   *
   * @param inquiryCommentReplyId 삭제할 답글 ID
   * @retuuurns 삭제 성공 시 답글 ID, 실패 시 에러 발생.
   * @throws Error 답글 삭제에 실패한 경우.
   */
  deleteByInquiryCommentReplyId(inquiryCommentReplyId: number): Promise<number>;
}
