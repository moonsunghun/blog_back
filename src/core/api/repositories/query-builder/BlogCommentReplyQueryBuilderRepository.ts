import { Repository } from 'typeorm';
import { BlogCommentReply } from '../../../models/entities/BlogCommentReply';
import { BlogComment } from '../../../models/entities/BlogComment';
import { BlogCommentReplyListRequestDto } from '../../../models/dtos/request/blog/reply/BlogCommentReplyListRequestDto';

/**
 * BlogCommentReply 엔티티에 대한 커스텀 QueryBuilder 레포지토리입니다.
 *
 * 이 객체는 TypeORM의 Repository를 확장하여 동적 페이징 기반의 댓글의 답글 목록 조회 쿼리를 정의합니다.
 *
 * 주요 메서드:
 * - dynamicQueryPagingByBlogComment(): 특정 블로그 게시글에 대한 댓글의 답글 목록을 페이지네이션 기반으로 조회
 *
 * 사용 방식:
 * ```ts
 * const customRepo = AppDataSource.getRepository(BlogCommentReply).extend(BlogCommentReplyQueryBuilderRepository);
 * const [comments, total] = await customRepo.dynamicQueryPagingByBlogComment(blogComment, dto);
 * ```
 */
export const BlogCommentReplyQueryBuilderRepository = {
  /**
   * 특정 블로그 게시글 댓글(`BlogComment`)에 대한 답글 목록을 페이지네이션과 함께 조회합니다.
   *
   * 이 메서드는 댓글 ID를 기준으로 답글 목록을 쿼리하고,
   * `BlogCommentReplyListRequestDto`에 정의된 페이징 조건에 따라 결과를 제한합니다.
   *
   * @param blogComment 조회 대상이 되는 댓글 엔티티
   * @param blogCommentReplyListRequestDto 페이징 및 정렬 조건을 담은 DTO
   *
   * @returns [조회된 답글 배열, 전체 답글 수] 형태의 튜플
   */
  dynamicQueryPagingByBlogComment(
    this: Repository<BlogCommentReply>,
    blogComment: BlogComment,
    blogCommentReplyListRequestDto: BlogCommentReplyListRequestDto
  ): Promise<[BlogCommentReply[], number]> {
    const selectQueryBuild = this.createQueryBuilder('blog_comment_reply')
      .innerJoinAndSelect('blog_comment_reply.blogComment', 'blog_comment')
      .where('blog_comment.id = :blogCommentId', { blogCommentId: blogComment.id })
      .skip(blogCommentReplyListRequestDto.getOffset())
      .take(blogCommentReplyListRequestDto.getLimit());

    return selectQueryBuild.getManyAndCount();
  },
};
