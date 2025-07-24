import { BlogComment } from '../../../models/entities/BlogComment';
import { Repository } from 'typeorm';
import { Blog } from '../../../models/entities/Blog';
import { BlogCommentListRequestDto } from '../../../models/dtos/request/blog/comment/BlogCommentListRequestDto';

export const BlogCommentQueryBuilderRepository = {
  /**
   * 특정 블로그(Blog)에 해당하는 댓글(BlogComment) 목록을 페이징 처리하여 조회합니다.
   *
   * @param blog 조회 대상 블로그
   * @param blogCommentListRequestDto 페이징 및 정렬 조건 DTO
   * @returns 댓글 목록과 총 개수를 포함하는 튜플 [comments, totalCount]
   */
  dynamicQueryPagingByBlog(
    this: Repository<BlogComment>,
    blog: Blog,
    blogCommentListRequestDto: BlogCommentListRequestDto
  ): Promise<[BlogComment[], number]> {
    const selectQueryBuild = this.createQueryBuilder('blog_comment')
      .leftJoinAndSelect('blog_comment.blog', 'blog')
      .where('blog.id = :blogId', { blogId: blog.id })
      .skip(blogCommentListRequestDto.getOffset())
      .take(blogCommentListRequestDto.getLimit());

    return selectQueryBuild.getManyAndCount();
  },
};
