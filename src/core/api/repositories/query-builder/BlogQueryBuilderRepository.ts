import { Repository } from 'typeorm';
import { Blog } from '../../../models/entities/Blog';
import { BlogSearchRequestDto } from '../../../models/dtos/request/blog/BlogSearchRequestDto';

/**
 * Blog 엔티티에 대한 커스텀 쿼리 빌더 레포지토리입니다.
 *
 * 게시글 검색 및 페이징 기능을 수행하는 메서드를 제공합니다.
 *
 * 주요 기능:
 * - 검색 조건: 제목
 * - 페이징 처리: limit 및 offset을 DTO에서 추출
 *
 * 주의사항:
 * - `this`는 반드시 `Repository<Blog>` 객체로 바인딩되어야 합니다.
 */
export const BlogQueryBuilderRepository = {
  /**
   * BlogSearchRequestDto에 따라 동적으로 조건을 적용한
   * 검색 및 페이징 쿼리를 실행합니다.
   *
   * @param this Blog 엔티티용 TypeORM Repository 인스턴스
   * @param blogSearchRequestDto 검색 조건과 페이징 정보를 담은 DTO
   * @returns 조건에 맞는 게시글 목록과 전체 개수의 튜플
   */
  dynamicQuerySearchAndPagingByDto(
    this: Repository<Blog>,
    blogSearchRequestDto: BlogSearchRequestDto
  ): Promise<[Blog[], number]> {
    const selectQueryBuilder = this.createQueryBuilder('blog')
      .limit(blogSearchRequestDto.perPageSize) 
      .offset(blogSearchRequestDto.getOffset());

    if (blogSearchRequestDto.title) {
      selectQueryBuilder.andWhere('blog.title LIKE :title', {
        title: `%${blogSearchRequestDto.title}%`,
      });
    }

    if (blogSearchRequestDto.orderBy) {
      selectQueryBuilder.orderBy('blog.createDateTime', blogSearchRequestDto.orderBy);
    }

    return selectQueryBuilder.getManyAndCount();
  },

  
  getDetailBlog(
    this: Repository<Blog>,
    blogId: number
  ): Promise<Blog | null> {
      return this.createQueryBuilder('blog') 
          .where('blog.id = :blogId', {blogId})
          .getOne();
  }
 
}; 