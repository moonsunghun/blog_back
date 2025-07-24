import { Inquiry } from '../../../models/entities/Inquiry';

/**
 * Inquiry 엔티티의 저장 기능을 정의하는 저장소 인터페이스입니다.
 *
 * 이 인터페이스는 커스텀 저장소 구현 시 필요한 메서드 시그니처를 정의하며,
 * 도메인 계층에서 의존성을 분리하기 위해 사용됩니다.
 *
 * 주요 기능:
 * - save: Inquiry 엔티티를 저장하고 해당 엔티티의 ID를 반환
 * - findById: Inquiry 고유번호 데이터베이스에서 조회
 *
 * 주의사항:
 * - 실제 저장소 구현체는 TypeORM 또는 In-Memory 방식일 수 있으며, 의존성 주입 등을 통해 구현됩니다.
 */
export interface InquiryRepository {
  /**
   * Inquiry 엔티티를 저장합니다.
   *
   * @param inquiry 저장할 Inquiry 인스턴스
   * @returns 저장된 Inquiry 엔티티의 ID (Primary Key)
   *
   * @throws Error 저장 과정에서 데이터베이스 오류가 발생할 경우
   */
  save(inquiry: Inquiry): Promise<number>;

  /**
   * 주어진 ID에 해당하는 문의 게시글을 조회합니다.
   *
   * 이 메서드는 `inquiryId`를 기반으로 데이터베이스에서 해당 문의 게시글을 검색합니다.
   *
   * @param inquiryId - 조회할 문의 게시글의 고유 ID
   * @returns 조회된 Inquiry 엔티티 또는 존재하지 않을 경우 null
   *
   * 주의사항:
   * - 삭제되었거나 존재하지 않는 ID의 경우 null이 반환됩니다.
   */
  findById(inquiryId: number): Promise<Inquiry | null>;

  /**
   * 주어진 문의 게시글 ID를 기반으로 문의 정보와 연관된 사용자 정보를 조회합니다.
   *
   * @param {number} inquiryId - 조회할 문의 게시글의 고유 ID
   * @returns {Promise<Inquiry | null>} 조회된 문의 게시글 엔티티 또는 존재하지 않으면 null
   *
   * @description
   * - 해당 함수는 `inquiry` 엔티티와 `user` 엔티티 간의 관계를 포함하여 조회합니다.
   * - 비회원이 작성한 경우, `user` 필드는 `null`일 수 있습니다.
   * - 내부적으로 TypeORM의 `relations` 옵션을 사용하여 연관 사용자 데이터를 함께 로딩합니다.
   *
   * @example
   * const inquiry = await findInquiryWithUserByInquiryId(15);
   * if (inquiry?.user) {
   *   console.log(`작성자 이메일: ${inquiry.user.email}`);
   * }
   */
  findInquiryWithUserByInquiryId(inquiryId: number): Promise<Inquiry | null>;

  /**
   * 비회원 닉네임으로 작성된 문의글을 조회합니다.
   *
   * @param {string} guestNickName - 조회할 비회원 닉네임
   * @returns {Promise<Inquiry | null>} 해당 닉네임으로 작성된 문의글이 존재하면 Inquiry 객체, 없으면 null 반환
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
  findByGuestNickName(guestNickName: string): Promise<Inquiry | null>;

  /**
   * 기존 문의 게시글 정보를 새로운 데이터로 병합하여 업데이트합니다.
   *
   * - TypeORM의 `merge` 메서드를 사용하여 기존 엔티티(`oldInquiry`)에
   *   새 엔티티(`newInquiry`)의 변경 내용을 병합합니다.
   * - 병합된 결과는 `save` 메서드를 통해 데이터베이스에 반영됩니다.
   *
   * @param oldInquiry - 기존의 문의 게시글 엔티티
   * @param newInquiry - 새로운 변경 내용을 담은 문의 게시글 엔티티
   * @returns 업데이트된 문의 게시글 엔티티
   */
  update(oldInquiry: Inquiry, newInquiry: Inquiry): Promise<Inquiry>;

  /**
   * 지정한 ID에 해당하는 문의 게시글을 데이터베이스에서 삭제합니다.
   *
   * 주요 기능:
   * - TypeORM의 `delete` 메서드를 사용하여 문의 게시글을 삭제합니다.
   * - 삭제 성공 여부를 `DeleteResult.affected` 값을 통해 확인합니다.
   *
   * 예외 처리:
   * - 삭제된 행이 없을 경우 예외를 발생시킵니다.
   *
   * @param id 삭제할 문의 게시글의 고유 ID
   * @returns 삭제된 문의 게시글의 ID
   * @throws Error 문의 게시글 삭제에 실패한 경우 (삭제 대상이 없거나 DB 오류)
   */
  deleteById(id: number): Promise<number>;

}
