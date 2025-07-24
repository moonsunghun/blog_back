import { InquiryComment } from '../../../models/entities/InquiryComment';
import { Repository } from 'typeorm';
import { Inquiry } from '../../../models/entities/Inquiry';
import { InquiryCommentListRequestDto } from '../../../models/dtos/request/inquiry/comment/InquiryCommentListRequestDto';

/**
 * InquiryComment 엔티티에 대한 커스텀 QueryBuilder 레포지토리입니다.
 *
 * 이 객체는 TypeORM의 Repository를 확장하여 동적 페이징 기반의 댓글 목록 조회 쿼리를 정의합니다.
 *
 * 주요 메서드:
 * - dynamicQueryPagingByInquiry(): 특정 문의글에 대한 댓글 목록을 페이지네이션 기반으로 조회
 *
 * 사용 방식:
 * ```ts
 * const customRepo = AppDataSource.getRepository(InquiryComment).extend(InquiryCommentQueryBuilderRepository);
 * const [comments, total] = await customRepo.dynamicQueryPagingByInquiry(inquiry, dto);
 * ```
 */
export const InquiryCommentQueryBuilderRepository = {
  /**
   * 특정 문의글(Inquiry)에 해당하는 댓글(InquiryComment) 목록을 페이징 처리하여 조회합니다.
   *
   * @param inquiry 조회 대상 문의글
   * @param inquiryCommentListRequestDto 페이징 및 정렬 조건 DTO
   * @returns 댓글 목록과 총 개수를 포함하는 튜플 [comments, totalCount]
   */
  dynamicQueryPagingByInquiry(
    this: Repository<InquiryComment>,
    inquiry: Inquiry,
    inquiryCommentListRequestDto: InquiryCommentListRequestDto
  ): Promise<[InquiryComment[], number]> {
    const selectQueryBuild = this.createQueryBuilder('inquiry_comment')
      .leftJoinAndSelect('inquiry_comment.inquiry', 'inquiry')
      .leftJoinAndSelect('inquiry_comment.user', 'user')
      .where('inquiry.id = :inquiryId', { inquiryId: inquiry.id })
      .skip(inquiryCommentListRequestDto.getOffset())
      .take(inquiryCommentListRequestDto.getLimit());

    return selectQueryBuild.getManyAndCount();
  },
};
