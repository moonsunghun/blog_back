import { DeleteResult, Repository } from 'typeorm';
import { InquiryRepository } from '../../inquiry/InquiryRepository';
import { Inquiry } from '../../../../models/entities/Inquiry';
import { AppDataSource } from '../../../../config/DatabaseConfig';

/**
 * InquiryRepository 인터페이스의 실제 구현체입니다.
 *
 * TypeORM의 Repository를 사용하여 Inquiry 엔티티를 저장하며,
 * 데이터 소스는 AppDataSource로부터 주입받습니다.
 *
 * 주요 기능:
 * - save: Inquiry 엔티티를 저장하고 해당 엔티티의 ID를 반환
 * - findById: Inquiry 고유번호 데이터베이스에서 조회
 *
 * 주의사항:
 * - AppDataSource는 TypeORM의 DataSource 인스턴스로 사전에 초기화되어 있어야 합니다.
 * - 저장 실패 시 예외가 발생할 수 있으며, 별도 예외 처리는 포함되어 있지 않습니다.
 */
export class InquiryRepositoryImpl implements InquiryRepository {
  /** TypeORM의 Repository 인스턴스 (Inquiry 전용) */
  private readonly inquiryRepository: Repository<Inquiry>;

  /**
   * InquiryRepositoryImpl 생성자입니다.
   * 내부에서 AppDataSource를 통해 Repository를 초기화합니다.
   */
  constructor() {
    this.inquiryRepository = AppDataSource.getRepository(Inquiry);
  }

  /**
   * Inquiry 엔티티를 저장하고, 저장된 엔티티의 ID를 반환합니다.
   *
   * @param inquiry 저장할 Inquiry 인스턴스
   * @returns 저장된 Inquiry의 ID
   * @throws Error 저장 도중 DB 오류가 발생할 경우
   */
  async save(inquiry: Inquiry): Promise<number> {
    const result: Inquiry = await this.inquiryRepository.save(inquiry);
    return result.id;
  }

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
  async findById(inquiryId: number): Promise<Inquiry | null> {
    return await this.inquiryRepository.findOne({
      where: { id: inquiryId },
    });
  }

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
  async findInquiryWithUserByInquiryId(inquiryId: number): Promise<Inquiry | null> {
    return await this.inquiryRepository.findOne({
      where: { id: inquiryId },
      relations: ['user'],
    });
  }

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
  async findByGuestNickName(guestNickName: string): Promise<Inquiry | null> {
    return await this.inquiryRepository.findOne({
      where: { guestNickName: guestNickName },
    });
  }

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
  async update(oldInquiry: Inquiry, newInquiry: Inquiry): Promise<Inquiry> {
    return await this.inquiryRepository.save(this.inquiryRepository.merge(oldInquiry, newInquiry));
  }

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
   * @param inquiryId 삭제할 문의 게시글의 고유 ID
   * @returns 삭제된 문의 게시글의 ID
   * @throws Error 문의 게시글 삭제에 실패한 경우 (삭제 대상이 없거나 DB 오류)
   */
  async deleteById(id: number): Promise<number> {
    const deleteResult: DeleteResult = await this.inquiryRepository.delete({
      id: id,
    });

    if (deleteResult.affected && deleteResult.affected > 0) {
      return id;
    } else {
      throw new Error(`문의 게시글 ID ${id} 삭제 실패`);
    }
  }
}
