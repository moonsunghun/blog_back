// blogs 관련 서비스

import { AppDataSource } from '../../../config/DatabaseConfig';
import { Blog } from '../../../models/entities/Blog';
import { DefaultResponse } from '../../../constant/DefaultResponse';
import { Page } from '../../../constant/Page';
import { BlogListResponseDto } from '../../../models/dtos/response/blog/BlogListResponseDto';
import { BlogSearchRequestDto } from '../../../models/dtos/request/blog/BlogSearchRequestDto';
import { BlogQueryBuilderRepository } from '../../repositories/query-builder/BlogQueryBuilderRepository';
import { BlogDetailSearchRequestDto } from '../../../models/dtos/request/blog/BlogDetailSearchRequestDto';
import { BlogDetailResponseDto } from '../../../models/dtos/response/blog/BlogDetailResponseDto';
import { HttpExceptionResponse } from '../../exception/HttpExceptionResponse';
import { BlogCreateRequestDto } from '../../../models/dtos/request/blog/BlogCreateRequestDto';
import { BlogCreateResponseDto } from '../../../models/dtos/response/blog/BlogCreateResponseDto';
import { BlogRepository } from '../../repositories/blog/BlogRepository';
import { BlogRepositoryImpl } from '../../repositories/implements/blog/BlogRepositoryImpl';
import { BlogUpdateResponseDto } from '../../../models/dtos/response/blog/BlogUpdateResponseDto';
import { BlogUpdateRequestDto } from '../../../models/dtos/request/blog/BlogUpdateRequestDto';
import { logger } from '../../../utilities/Logger';

export class BlogService {
  private readonly blogRepository: BlogRepository = new BlogRepositoryImpl();

  private readonly blogQueryBuilderRepository = AppDataSource.getRepository(Blog).extend(
    BlogQueryBuilderRepository
  );

  /**
   * 블로그글을 생성
   *
   * @param blogCreatedRequestDto 게시글 작성 요청 DTO
   * @param files Multer로 전달된 업로드 파일 배열
   * @returns 생성된 게시글 ID 및 저장된 파일 정보가 포함된 응답 DTO
   *
   * @throws Error 게시글 저장 실패 시 예외 발생
   */
  async createBlog(
    blogCreatedRequestDto: BlogCreateRequestDto
  ): Promise<DefaultResponse<BlogCreateResponseDto>> {
    const blogId: number = await this.blogRepository.save(
      blogCreatedRequestDto.toEntity(blogCreatedRequestDto)
    );

    if (!blogId || blogId <= 0) {
      const errorMessage = `블로그글 등록 실패 데이터 베이스 문제 발생`;

      throw new HttpExceptionResponse(500, errorMessage);
    }

    return DefaultResponse.responseWithData(
      201,
      '블로그글 작성 성공',
      new BlogCreateResponseDto(blogId)
    );
  }

  async updateBlog(
    blogUpdateRequestDto: BlogUpdateRequestDto
  ): Promise<DefaultResponse<BlogUpdateResponseDto>> {
    const blog: Blog = await this.blogRepository.update(
      this.checkBlog(await this.blogRepository.findById(blogUpdateRequestDto.blogId)),
      blogUpdateRequestDto.toEntity(blogUpdateRequestDto)
    );

    return DefaultResponse.responseWithData(
      200,
      '블로그 게시글 수정 성공',
      new BlogUpdateResponseDto(blog.id)
    );
  }

  async deleteBlog(blogId: number): Promise<
    DefaultResponse<{
      id: number;
    }>
  > {
    try {
      const blog: Blog = this.checkBlog(await this.blogRepository.findById(blogId));

      const deleteByBlogId: number = await this.blogRepository.deleteById(blog.id);

      return DefaultResponse.responseWithData(200, '블로그 게시글 삭제 성공', {
        id: deleteByBlogId,
      });
    } catch (error: any) {
      if (error instanceof HttpExceptionResponse) {
        logger.error(`블로그 게시글 삭제 간 문제 발생 - 문제 내용: ${error.message}`);

        throw new HttpExceptionResponse(error.statusCode, error.message);
      } else {
        logger.error(`블로그 게시글 삭제 간 문제 발생 - 문제 내용: ${error.message}`);

        throw new HttpExceptionResponse(500, '내부 서버 문제 발생');
      }
    }
  }

  /**
   * 블로그 목록 조회 (페이징, 검색 등)
   * @param pageNumber 페이지 번호
   * @param perPageSize 페이지 당 항목 수
   * @param orderBy 정렬 순서 (ASC, DESC)
   * @param title 제목 검색
   */
  async getBlogListWithSearch(
    blogSearchRequestDto: BlogSearchRequestDto
  ): Promise<DefaultResponse<BlogListResponseDto>> {
    const results: [Blog[], number] =
      await this.blogQueryBuilderRepository.dynamicQuerySearchAndPagingByDto(blogSearchRequestDto);

    return DefaultResponse.responseWithPaginationAndData(
      200,
      '블로그 목록 조회 성공',
      new Page<BlogListResponseDto>(
        blogSearchRequestDto.pageNumber,
        blogSearchRequestDto.perPageSize,
        results[1],
        results[0].map((blog: Blog): BlogListResponseDto => new BlogListResponseDto(blog))
      )
    );
  }

  async getDetailBlog(
    blogDetailSearchRequestDto: BlogDetailSearchRequestDto
  ): Promise<DefaultResponse<BlogDetailResponseDto>> {
    const result: Blog = this.checkBlog(
      await this.blogQueryBuilderRepository.getDetailBlog(blogDetailSearchRequestDto.blogId)
    );

    return DefaultResponse.responseWithData(
      200,
      '블로그 상세 조회 성공',
      new BlogDetailResponseDto(result)
    );
  }

  private checkBlog(blog: Blog | null): Blog {
    if (!blog) {
      throw new HttpExceptionResponse(404, '블로그 게시글 조회 실패');
    }

    return blog;
  }
}
