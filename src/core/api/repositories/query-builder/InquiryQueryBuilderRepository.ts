import { Repository } from 'typeorm';
import { Inquiry } from '../../../models/entities/Inquiry';
import { InquirySearchRequestDto } from '../../../models/dtos/request/inquiry/InquirySearchRequestDto';

/**
 * Inquiry 엔티티에 대한 커스텀 쿼리 빌더 레포지토리입니다.
 *
 * 이 객체는 TypeORM Repository에 동적으로 mixin 형식으로 주입되어 사용되며,
 * 게시글 검색 및 페이징 기능을 수행하는 메서드를 제공합니다.
 *
 * 주요 기능:
 * - 검색 조건: 제목, 작성자 닉네임, 답변 상태, 본문 내용
 * - 페이징 처리: limit 및 offset을 DTO에서 추출
 *
 * 주의사항:
 * - `this`는 반드시 `Repository<Inquiry>` 객체로 바인딩되어야 합니다.
 * - `inquiry.guestName` 필드는 실제 DB 컬럼명이 맞는지 확인 필요 (`guestNickName`일 가능성 있음)
 */
export const InquiryQueryBuilderRepository = {
  /**
   * InquirySearchRequestDto에 따라 동적으로 조건을 적용한
   * 검색 및 페이징 쿼리를 실행합니다.
   *
   * @param inquirySearchRequestDto 검색 조건과 페이징 정보를 담은 DTO
   * @returns 조건에 맞는 게시글 목록과 전체 개수의 튜플
   *
   * @example
   * const [rows, total] = await inquiryRepository.dynamicQuerySearchAndPagingByDto(dto);
   */
  dynamicQuerySearchAndPagingByDto(
    this: Repository<Inquiry>,
    inquirySearchRequestDto: InquirySearchRequestDto
  ): Promise<[Inquiry[], number]> {
    const selectQueryBuilder = this.createQueryBuilder('inquiry')
      .leftJoinAndSelect('inquiry.user', 'user')
      .limit(inquirySearchRequestDto.getLimit())
      .offset(inquirySearchRequestDto.getOffset());

    if (inquirySearchRequestDto.title) {
      selectQueryBuilder.andWhere('inquiry.title LIKE :title', {
        title: `%${inquirySearchRequestDto.title}%`,
      });
    }

    if (inquirySearchRequestDto.writer) {
      selectQueryBuilder.andWhere(
        '(inquiry.guestNickName LIKE :writer OR user.nickName LIKE :writer)',
        {
          writer: `%${inquirySearchRequestDto.writer}%`,
        }
      );
    }

    if (inquirySearchRequestDto.answerStatus) {
      selectQueryBuilder.andWhere('inquiry.answerStatus = :answerStatus', {
        answerStatus: inquirySearchRequestDto.answerStatus,
      });
    }

    if (inquirySearchRequestDto.content) {
      selectQueryBuilder.andWhere('inquiry.content LIKE :content', {
        content: `%${inquirySearchRequestDto.content}%`,
      });
    }

    selectQueryBuilder.orderBy(
      `inquiry.${inquirySearchRequestDto.orderColumn}`,
      inquirySearchRequestDto.orderBy
    );

    return selectQueryBuilder.getManyAndCount();
  },

  /**
   * 문의, 첨부파일, 댓글, 댓글에 달린 답글까지 포함한 전체 상세 정보를 조회합니다.
   *
   * @param inquiryId - 조회할 문의의 고유 ID
   * @returns 해당 ID의 문의에 대한 전체 상세 정보를 포함한 Inquiry 객체, 없으면 null
   */
  getDetailInquiryWithCommentAndCommentReply(
    this: Repository<Inquiry>,
    inquiryId: number
  ): Promise<Inquiry | null> {
    return this.createQueryBuilder('inquiry')
      .leftJoinAndSelect('inquiry.user', 'user')
      .leftJoinAndSelect('inquiry.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .leftJoinAndSelect('comments.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'replyUser')
      .where('inquiry.id = :inquiryId', { inquiryId })
      .andWhere('inquiry.deleteDateTime IS NULL')
      .getOne();
  },
};
