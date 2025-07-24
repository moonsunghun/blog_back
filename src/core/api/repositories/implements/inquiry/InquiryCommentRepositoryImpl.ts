import { DeleteResult, Repository } from 'typeorm';
import { InquiryCommentRepository } from '../../inquiry/InquiryCommentRepository';
import { InquiryComment } from '../../../../models/entities/InquiryComment';
import { AppDataSource } from '../../../../config/DatabaseConfig';

/**
 * 문의 게시글 댓글 저장소 구현 클래스입니다.
 *
 * 이 클래스는 InquiryCommentRepository 인터페이스를 구현하며,
 * TypeORM의 Repository를 활용하여 InquiryComment 엔티티를 데이터베이스에 저장합니다.
 *
 * 주요 기능:
 * - 댓글 저장 (save)
 * - 고유 번호를 이용한 조회 (findById)
 * - 문의 게시글 Entity와 댓글 고유 번호를 이용한 조회 (findByInquiryAndInquiryCommentId)
 * - 댓글 고유번호를 이용한 댓글 삭제 (delectByInquiryCommentId)
 *
 * 주의사항:
 * - AppDataSource 초기화가 선행되어야 합니다.
 */
export class InquiryCommentRepositoryImpl implements InquiryCommentRepository {
  private readonly inquiryCommentRepository: Repository<InquiryComment>;

  /**
   * InquiryCommentRepositoryImpl 클래스의 생성자입니다.
   *
   * TypeORM DataSource(AppDataSource)로부터 InquiryComment에 대한 Repository를 주입받습니다.
   */
  constructor() {
    this.inquiryCommentRepository = AppDataSource.getRepository(InquiryComment);
  }

  /**
   * 댓글 엔티티를 저장하는 메서드입니다.
   *
   * @param inquiryComment 저장할 InquiryComment 엔티티
   * @returns 저장된 댓글의 고유 ID
   *
   * @throws 저장 실패 시 예외 발생
   */
  async save(inquiryComment: InquiryComment): Promise<number> {
    return (await this.inquiryCommentRepository.save(inquiryComment)).id;
  }

  /**
   * 주어진 ID에 해당하는 문의 게시글의 댓글을 조회합니다.
   *
   * 이 메서드는 `inquiryCommentId`를 기반으로 데이터베이스에서 해당 문의 게시글의 댓글을 검색합니다.
   *
   * @param inquiryCommentId - 조회할 문의 게시글 댓글의 고유 ID
   * @returns 조회된 InquiryComment 엔티티 또는 존재하지 않을 경우 null
   *
   * 주의사항:
   * - 삭제되었거나 존재하지 않는 ID의 경우 null이 반환됩니다.
   */
  async findById(inquiryCommentId: number): Promise<InquiryComment | null> {
    return await this.inquiryCommentRepository.findOne({
      where: { id: inquiryCommentId },
      relations: ['inquiry'],
    });
  }

  /**
   * 문의 게시글과 댓글 ID를 기반으로 댓글을 찾습니다.
   *
   * @param inquiryId 문의 게시글 ID
   * @param inquiryCommentId 찾고자 하는 댓글 ID
   * @returns 일치하는 댓글 객체 또는 null (댓글을 찾을 수 없는 경우).
   * @throws Error 데이터베이스 쿼리 실패 시.
   */
  async findByInquiryAndInquiryCommentId(
    inquiryId: number,
    inquiryCommentId: number
  ): Promise<InquiryComment | null> {
    return await this.inquiryCommentRepository.findOne({
      where: {
        id: inquiryCommentId,
        inquiry: {
          id: inquiryId,
        },
      },
    });
  }

  /**
   * 주어진 문의 게시글 댓글 ID를 기반으로 댓글 정보와 연관된 사용자 정보를 조회합니다.
   *
   * @param {number} inquiryCommentId - 조회할 문의 게시글 댓글의 고유 ID
   * @returns {Promise<InquiryComment | null>} 조회된 문의 게시글 댓글 엔티티 또는 존재하지 않으면 null
   *
   * @description
   * - 해당 함수는 `inquiryComment` 엔티티와 `inquiry`, `user` 엔티티 간의 관계를 포함하여 조회합니다.
   * - 비회원이 작성한 경우, `user` 필드는 `null`일 수 있습니다.
   * - 내부적으로 TypeORM의 `relations` 옵션을 사용하여 연관 사용자 데이터를 함께 로딩합니다.
   *
   * @example
   * const inquiry = await findInquiryCommentWithUserByInquiryCommentId(15);
   * if (inquiryComment?.user) {
   *   console.log(`작성자 이메일: ${inquiryComment.user.email}`);
   * }
   */
  async findInquiryCommentWithUserByInquiryCommentId(
    inquiryCommentId: number
  ): Promise<InquiryComment | null> {
    return await this.inquiryCommentRepository.findOne({
      where: { id: inquiryCommentId },
      relations: ['inquiry', 'user'],
    });
  }

  /**
   * 비회원 닉네임으로 작성된 문의 댓글을 조회합니다.
   *
   * @param {string} guestNickName - 조회할 비회원 닉네임
   * @returns {Promise<InquiryComment | null>} 해당 닉네임으로 작성된 댓글이 존재하면 InquiryComment 객체, 없으면 null 반환
   *
   * @description
   * - 댓글 작성 시 비회원이 입력한 `guestNickName` 값을 기준으로 댓글을 조회합니다.
   * - 비회원 닉네임의 중복 여부 확인, 댓글 작성자 식별 등의 목적에 활용됩니다.
   *
   * @example
   * const comment = await this.findByGuestNickName('익명1023');
   * if (comment) {
   *   console.log('이미 사용된 닉네임입니다.');
   * }
   */
  async findByGuestNickName(guestNickName: string): Promise<InquiryComment | null> {
    return await this.inquiryCommentRepository.findOne({
      where: { guestNickName: guestNickName },
    });
  }

  /**
   * 특정 ID를 가진 댓글을 삭제합니다.
   *
   * @param inquiryCommentId 삭제할 댓글 ID
   * @retuuurns 삭제 성공 시 댓글 ID, 실패 시 에러 발생.
   * @throws Error 댓글 삭제에 실패한 경우.
   */
  async delectByInquiryCommentId(inquiryCommentId: number): Promise<number> {
    const deleteResult: DeleteResult = await this.inquiryCommentRepository.delete({
      id: inquiryCommentId,
    });

    if (deleteResult.affected && deleteResult.affected > 0) {
      return inquiryCommentId;
    } else {
      throw new Error(`문의 게시글 댓글 ID ${inquiryCommentId} 삭제 실패`);
    }
  }
}
