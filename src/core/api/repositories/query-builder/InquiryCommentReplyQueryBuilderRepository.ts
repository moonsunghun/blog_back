import { Repository } from 'typeorm';
import { InquiryCommentReply } from '../../../models/entities/InquiryCommentReply';
import { InquiryComment } from '../../../models/entities/InquiryComment';
import { InquiryCommentReplyListRequestDto } from '../../../models/dtos/request/inquiry/reply/InquiryCommentReplyListRequestDto';

/**
 * InquiryCommentReply 엔티티에 대한 커스텀 QueryBuilder 레포지토리입니다.
 *
 * 이 객체는 TypeORM의 Repository를 확장하여 동적 페이징 기반의 댓글의 답글 목록 조회 쿼리를 정의합니다.
 *
 * 주요 메서드:
 * - dynamicQueryPagingByInquiry(): 특정 문의글에 대한 댓글의 답글 목록을 페이지네이션 기반으로 조회
 *
 * 사용 방식:
 * ```ts
 * const customRepo = AppDataSource.getRepository(InquiryCommentReply).extend(InquiryCommentReplyQueryBuilderRepository);
 * const [comments, total] = await customRepo.dynamicQueryPagingByInquiryComment(inquiry, dto);
 * ```
 */
export const InquiryCommentReplyQueryBuilderRepository = {
  /**
   * 특정 문의 댓글(`InquiryComment`)에 대한 답글 목록을 페이지네이션과 함께 조회합니다.
   *
   * 이 메서드는 댓글 ID를 기준으로 답글 목록을 쿼리하고,
   * `InquiryCommentReplyListRequestDto`에 정의된 페이징 조건에 따라 결과를 제한합니다.
   *
   * @param inquiryComment 조회 대상이 되는 댓글 엔티티
   * @param inquiryCommentReplyListRequestDto 페이징 및 정렬 조건을 담은 DTO
   *
   * @returns [조회된 답글 배열, 전체 답글 수] 형태의 튜플
   */
  dynamicQueryPagingByInquiryComment(
    this: Repository<InquiryCommentReply>,
    inquiryComment: InquiryComment,
    inquiryCommentReplyListRequestDto: InquiryCommentReplyListRequestDto
  ): Promise<[InquiryCommentReply[], number]> {
    const selectQueryBuild = this.createQueryBuilder('inquiry_comment_reply')
      .innerJoinAndSelect('inquiry_comment_reply.inquiryComment', 'inquiry_comment')
      .innerJoinAndSelect('inquiry_comment.inquiry', 'inquiry')
      .leftJoinAndSelect('inquiry_comment_reply.user', 'user')
      .where('inquiry_comment.id = :inquiryCommentId', { inquiryCommentId: inquiryComment.id })
      .skip(inquiryCommentReplyListRequestDto.getOffset())
      .take(inquiryCommentReplyListRequestDto.getLimit());

    return selectQueryBuild.getManyAndCount();
  },
};
