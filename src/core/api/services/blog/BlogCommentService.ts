import { AppDataSource } from '../../../config/DatabaseConfig';
import { DefaultResponse } from '../../../constant/DefaultResponse';
import { Page } from '../../../constant/Page';
import { HttpExceptionResponse } from '../../exception/HttpExceptionResponse';
import { BlogRepositoryImpl } from '../../repositories/implements/blog/BlogRepositoryImpl';
import { BlogRepository } from '../../repositories/blog/BlogRepository';
import { BlogComment } from '../../../models/entities/BlogComment';
import { BlogCommentListRequestDto } from '../../../models/dtos/request/blog/comment/BlogCommentListRequestDto';
import { BlogCommentListResponseDto } from '../../../models/dtos/response/blog/comment/BlogCommentListResponseDto';
import { Blog } from '../../../models/entities/Blog';
import { BlogCommentQueryBuilderRepository } from '../../repositories/query-builder/BlogCommentQueryBuilderRepository';
import { BlogCommentCreateRequestDto } from '../../../models/dtos/request/blog/comment/BlogCommentCreateRequestDto';
import { BlogCommentRepository } from '../../repositories/blog/BlogCommentRepository';
import { BlogCommentRepositoryImpl } from '../../repositories/implements/blog/BlogCommentRepositoryImpl';
import { logger } from '../../../utilities/Logger';
import { BlogCommentUpdateRequestDto } from '../../../models/dtos/request/blog/comment/BlogCommentUpdateRequestDto';
import { BlogCommentDeleteRequestDto } from '../../../models/dtos/request/blog/comment/BlogCommentDeleteRuquestDto';
/**
 * 블로그 게시글 댓글 서비스 로직을 담당하는 클래스입니다.
 *
 */
export class BlogCommentService {
  private readonly blogRepository: BlogRepository = new BlogRepositoryImpl();
  private readonly blogCommentRepository: BlogCommentRepository = new BlogCommentRepositoryImpl();

  private readonly blogCommentQueryBuilderRepository = AppDataSource.getRepository(
    BlogComment
  ).extend(BlogCommentQueryBuilderRepository);

  /**
   * 댓글 작성 처리
   *
   * @param blogId 블로그 게시글 고유 번호
   * @param blogCommentCreateRequestDto - 댓글 등록 요청 DTO
   * @returns 댓글 등록 성공 시 ID를 포함한 DefaultResponse 반환
   * @throws 저장 실패 시 에러 발생 및 로깅
   */
  async createBlogComment(
    blogId: number,
    blogCommentCreateRequestDto: BlogCommentCreateRequestDto
  ): Promise<DefaultResponse<number>> {
    return DefaultResponse.responseWithData(
      201,
      '블로그 게시글 댓글 작성 성공',
      await this.blogCommentRegisterStatusChecker(
        await this.blogCommentRepository.save(
          blogCommentCreateRequestDto.toEntity(
            await this.blogCheckInDatabase(blogId),
            blogCommentCreateRequestDto
          )
        ),
        '블로그 게시글 댓글 등록 실패: 데이터베이스 문제 발생'
      )
    );
  }

  async blogCommentUpdate(
    blogCommentUpdateRequestDto: BlogCommentUpdateRequestDto
  ): Promise<DefaultResponse<number>> {
    const blogComment: BlogComment | null =
      await this.blogCommentRepository.findByBlogAndBlogCommentId(
        (await this.blogCheckInDatabase(blogCommentUpdateRequestDto.blogId)).id,
        blogCommentUpdateRequestDto.blogCommentId
      );

    if (!blogComment) {
      throw new HttpExceptionResponse(
        404,
        '수정 대상 댓글을 데이터 베이스에서 찾을 수 없는 문제 발생'
      );
    }

    const blogCommentId: number = await this.blogCommentRepository.save(
      blogCommentUpdateRequestDto.toEntity(blogComment, blogCommentUpdateRequestDto)
    );

    return DefaultResponse.responseWithData(
      200,
      '문의 게시글 댓글 수정 성공',
      await this.blogCommentRegisterStatusChecker(
        blogCommentId,
        '블로그 게시글 댓글 수정 실패: 데이터베이스 문제 발생'
      )
    );
  }

  /**
   * 블로그 게시글 댓글 목록을 페이지네이션하여 조회합니다.
   *
   * @returns 페이지네이션된 댓글 목록을 담은 DefaultResponse 객체.
   * @throws Error 데이터베이스 쿼리 실패 시.
   * @param blogCommentListRequestDto 댓글 목록 조회 요청 DTO
   */
  async blogCommentSearchListWithPaging(
    blogCommentListRequestDto: BlogCommentListRequestDto
  ): Promise<DefaultResponse<BlogCommentListResponseDto>> {
    const results: [BlogComment[], number] =
      await this.blogCommentQueryBuilderRepository.dynamicQueryPagingByBlog(
        await this.blogCheckInDatabase(blogCommentListRequestDto.blogId),
        blogCommentListRequestDto
      );

    return DefaultResponse.responseWithPaginationAndData(
      200,
      `블로그 고유번호: ${blogCommentListRequestDto.blogId} 댓글 목록 조회 성공`,
      new Page<BlogCommentListResponseDto>(
        blogCommentListRequestDto.pageNumber,
        blogCommentListRequestDto.perPageSize,
        results[1],
        results[0].map(
          (blogComment: BlogComment): BlogCommentListResponseDto =>
            new BlogCommentListResponseDto(blogComment)
        )
      )
    );
  }

  /**
   * 블로그 게시글 데이터베이스에서 찾습니다.
   *
   * @param blogId 블로그 게시글 ID
   * @returns 문의 게시글 객체 또는 null (게시글을 찾을 수 없는 경우).
   * @throws HttpExceptionResponse 문의 게시글을 찾을 수 없는 경우.
   */
  private async blogCheckInDatabase(blogId: number): Promise<Blog> {
    const blog: Blog | null = await this.blogRepository.findById(blogId);

    if (!blog) {
      throw new HttpExceptionResponse(
        400,
        '조회할 댓글 대상 블로그 게시글 데이터 베이스에서 찾을 수 없는 문제 발생'
      );
    }

    return blog;
  }

  /**
   * 댓글 등록 상태를 확인합니다.
   *
   * @param blogCommentId 댓글 ID
   * @param errorMessage 오류 메시지
   * @returns 댓글 ID
   * @throws HttpExceptionResponse 오류 발생 시.
   */
  private async blogCommentRegisterStatusChecker(
    blogCommentId: number,
    errorMessage: string
  ): Promise<number> {
    if (!blogCommentId) {
      logger.error(errorMessage);
      throw new HttpExceptionResponse(500, errorMessage);
    }

    return blogCommentId;
  }

  /**
   * 블로그 게시글의 댓글을 삭제합니다.
   *
   * @param blogCommentDeleteRequestDto 삭제 요청 DTO.
   * @retuuurns 삭제 성공 여부를 담은 DefaultResponse 객체.
   * @throws HttpExceptionResponse 댓글을 찾을 수 없거나 삭제에 실패한 경우.
   */
  async deletedBlogComment(
    blogCommentDeleteRequestDto: BlogCommentDeleteRequestDto
  ): Promise<DefaultResponse<number>> {
    const blogComment: BlogComment | null =
      await this.blogCommentRepository.findByBlogAndBlogCommentId(
        (await this.blogCheckInDatabase(blogCommentDeleteRequestDto.blogId)).id,
        blogCommentDeleteRequestDto.blogCommentId
      );

    if (!blogComment) {
      throw new HttpExceptionResponse(
        404,
        '삭제 대상 댓글을 데이터 베이스에서 찾을 수 없는 문제 발생'
      );
    }

    try {
      return DefaultResponse.responseWithData(
        200,
        '문의 게시글 댓글 삭제 성공',
        await this.blogCommentRegisterStatusChecker(
          await this.blogCommentRepository.delectByBlogCommentId(blogComment.id),
          '블로그 게시글 댓글 삭제 실패: 데이터베이스 문제 발생'
        )
      );
    } catch (error: any) {
      logger.error(error.message);

      throw new HttpExceptionResponse(500, error.message);
    }
  }
}
