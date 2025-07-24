import { AppDataSource } from '../../../config/DatabaseConfig';
import { DefaultResponse } from '../../../constant/DefaultResponse';
import { HttpExceptionResponse } from '../../exception/HttpExceptionResponse';
import { BlogComment } from '../../../models/entities/BlogComment';
import { BlogCommentRepositoryImpl } from '../../repositories/implements/blog/BlogCommentRepositoryImpl';
import { BlogCommentRepository } from '../../repositories/blog/BlogCommentRepository';
import { BlogCommentReplyQueryBuilderRepository } from '../../repositories/query-builder/BlogCommentReplyQueryBuilderRepository';
import { BlogCommentReplyListResponseDto } from '../../../models/dtos/response/blog/reply/BlogCommentReplyListResponseDto';
import { BlogCommentReplyListRequestDto } from '../../../models/dtos/request/blog/reply/BlogCommentReplyListRequestDto';
import { Page } from '../../../constant/Page';
import { BlogCommentReply } from '../../../models/entities/BlogCommentReply';
import { BlogCommentReplyCreateDto } from '../../../models/dtos/request/blog/reply/BlogCommentReplyCreateDto';
import { logger } from '../../../utilities/Logger';
import { BlogCommentReplyRepositoryImpl } from '../../repositories/implements/blog/BlogCommentReplyRepositoryImpl';
import { BlogCommentReplyRepository } from '../../repositories/blog/BlogCommentReplyRepository';
import { BlogCommentReplyUpdateDto } from '../../../models/dtos/request/blog/reply/BlogCommentReplyUpdateDto';
import { BlogCommentReplyDeleteRequestDto } from '../../../models/dtos/request/blog/reply/BlogCommentReplyDeleteRequestDto';

/**
 * 블로그 게시글 댓글의 답글 작성을 담당하는 서비스 클래스입니다.
 *
 * 이 클래스는 특정 댓글에 대해 답글을 등록하는 기능을 제공합니다.
 * 댓글의 존재 여부를 확인하고, 해당 댓글에 연결된 답글을 저장합니다.
 *
 * 주요 메서드:
 * - createBlogCommentReply(): 특정 댓글에 대한 답글 등록
 *
 * 주의사항:
 * - 댓글이 존재하지 않을 경우 예외를 발생시킵니다.
 * - 답글 저장 실패 시 에러 로그를 기록하고 예외를 던집니다.
 */
export class BlogCommentReplyService {
  private readonly blogCommentRepository: BlogCommentRepository = new BlogCommentRepositoryImpl();
  private readonly blogCommentReplyRepository: BlogCommentReplyRepository =
    new BlogCommentReplyRepositoryImpl();

  private readonly blogCommentReplyQueryBuilderRepository = AppDataSource.getRepository(
    BlogCommentReply
  ).extend(BlogCommentReplyQueryBuilderRepository);

  /**
   * 문의 게시글 댓글의 답글 목록을 페이지네이션하여 조회합니다.
   *
   * @returns 페이지네이션된 댓글 목록을 담은 DefaultResponse 객체.
   * @throws Error 데이터베이스 쿼리 실패 시.
   * @param blogCommentReplyListRequestDto
   */
  async blogCommentReplySearchListWithPaging(
    blogCommentReplyListRequestDto: BlogCommentReplyListRequestDto
  ): Promise<DefaultResponse<BlogCommentReplyListResponseDto>> {
    const results: [BlogCommentReply[], number] =
      await this.blogCommentReplyQueryBuilderRepository.dynamicQueryPagingByBlogComment(
        await this.blogCommentCheckInDatabase(blogCommentReplyListRequestDto.blogCommentId),
        blogCommentReplyListRequestDto
      );

    return DefaultResponse.responseWithPaginationAndData(
      200,
      `게시글 댓글 고유번호: ${blogCommentReplyListRequestDto.blogCommentId} 답글 목록 조회 성공`,
      new Page<BlogCommentReplyListResponseDto>(
        blogCommentReplyListRequestDto.pageNumber,
        blogCommentReplyListRequestDto.perPageSize,
        results[1],
        results[0].map(
          (blogCommentReply: BlogCommentReply): BlogCommentReplyListResponseDto =>
            new BlogCommentReplyListResponseDto(blogCommentReply)
        )
      )
    );
  }

  /**
   * 문의 게시글의 댓글을 데이터베이스에서 찾습니다.
   *
   * @param blogCommentId 블로그 게시글의 댓글 ID
   * @returns 블로그 게시글 댓글 객체 또는 null (댓글글을 찾을 수 없는 경우).
   * @throws HttpExceptionResponse 문의 게시글의 댓글을 찾을 수 없는 경우.
   */
  private async blogCommentCheckInDatabase(blogCommentId: number): Promise<BlogComment> {
    const blogComment: BlogComment | null =
      await this.blogCommentRepository.findById(blogCommentId);

    if (!blogComment) {
      throw new HttpExceptionResponse(
        400,
        '조회할 댓글 대상 블로그 게시글 데이터 베이스에서 찾을 수 없는 문제 발생'
      );
    }

    return blogComment;
  }

  /**
   * 특정 댓글에 대한 답글을 등록합니다.
   *
   * @param blogCommentId 답글을 달 댓글의 고유 ID
   * @param blogCommentReplyCreateRequestDto 답글 생성 요청 DTO
   * @returns DefaultResponse<number> 등록된 답글의 ID를 포함한 응답 객체
   * @throws Error 댓글이 존재하지 않거나 DB 저장 실패 시 예외 발생
   */
  async createBlogCommentReply(
    blogCommentId: number,
    blogCommentReplyCreateRequestDto: BlogCommentReplyCreateDto
  ): Promise<DefaultResponse<number>> {
    console.log(blogCommentReplyCreateRequestDto.content);
    console.log(blogCommentReplyCreateRequestDto.userId);
    return DefaultResponse.responseWithData(
      201,
      '블로그 게시글 댓글의 답글 작성 성공',
      await this.blogCommentReplyRegisterStatusChecker(
        await this.blogCommentReplyRepository.save(
          blogCommentReplyCreateRequestDto.toEntity(
            await this.blogCommentCheckInDatabase(blogCommentId),
            blogCommentReplyCreateRequestDto
          )
        ),
        '블로그 게시글 댓글의 답글 등록 실패: 데이터베이스 문제 발생'
      )
    );
  }

  /**
   * 댓글의 답글 등록 상태를 확인합니다.
   *
   * @param blogCommentReplyId 댓글 답글 ID
   * @param errorMessage 오류 메시지
   * @returns 댓글의 답글 ID
   * @throws HttpExceptionResponse 오류 발생 시.
   */
  private async blogCommentReplyRegisterStatusChecker(
    blogCommentReplyId: number,
    errorMessage: string
  ): Promise<number> {
    if (!blogCommentReplyId) {
      logger.error(errorMessage);
      throw new HttpExceptionResponse(500, errorMessage);
    }

    return blogCommentReplyId;
  }

  /**
   * 블로그 댓글의 답글을 수정하는 비동기 함수입니다.
   *
   * 이 함수는 제공된 요청 DTO를 사용하여 문의 게시글 댓글의 답글을 데이터베이스에서 찾고,
   * 내용을 업데이트한 후 데이터베이스에 저장합니다.
   *
   * @param blogCommentReplyUpdateRequestDto 댓글 수정 요청 DTO
   * @returns 수정 성공 여부를 담은 DefaultResponse 객체.
   * @throws HttpExceptionResponse 데이터베이스 관련 오류 발생 시.
   */
  async blogCommentReplyUpdate(
    blogCommentReplyUpdateRequestDto: BlogCommentReplyUpdateDto
  ): Promise<DefaultResponse<number>> {
    const blogCommentReply: BlogCommentReply | null =
      await this.blogCommentReplyRepository.findByBlogCommentAndBlogCommentReplyId(
        (await this.blogCommentCheckInDatabase(blogCommentReplyUpdateRequestDto.blogCommentId)).id,
        blogCommentReplyUpdateRequestDto.blogCommentReplyId
      );

    if (!blogCommentReply) {
      throw new HttpExceptionResponse(
        404,
        '수정 대상 답글을 데이터 베이스에서 찾을 수 없는 문제 발생'
      );
    }

    const blogCommentReplyId: number = await this.blogCommentReplyRepository.save(
      blogCommentReplyUpdateRequestDto.toEntity(blogCommentReply, blogCommentReplyUpdateRequestDto)
    );

    return DefaultResponse.responseWithData(
      200,
      '블로그 댓글의 답글 수정 성공',
      await this.blogCommentReplyRegisterStatusChecker(
        blogCommentReplyId,
        '블로그 댓글의 답글 수정 실패: 데이터베이스 문제 발생'
      )
    );
  }

  async blogCommentReplyDelete(
    blogCommentReplyDeleteRequestDto: BlogCommentReplyDeleteRequestDto
  ): Promise<DefaultResponse<number>> {
    const blogCommentReply: BlogCommentReply | null =
      await this.blogCommentReplyRepository.findByBlogCommentAndBlogCommentReplyId(
        (await this.blogCommentCheckInDatabase(blogCommentReplyDeleteRequestDto.blogCommentId)).id,
        blogCommentReplyDeleteRequestDto.blogCommentReplyId
      );

    if (!blogCommentReply) {
      throw new HttpExceptionResponse(
        404,
        '삭제 대상 답글을 데이터 베이스에서 찾을 수 없는 문제 발생'
      );
    }

    try {
      return DefaultResponse.responseWithData(
        200,
        '문의 게시글 댓글의 답글 삭제 성공',
        await this.blogCommentReplyRegisterStatusChecker(
          await this.blogCommentReplyRepository.deleteByBlogCommentReplyId(blogCommentReply.id),
          '블로그 게시글 댓글의 답글 삭제 실패: 데이터베이스 문제 발생'
        )
      );
    } catch (error: any) {
      logger.error(error.message);

      throw new HttpExceptionResponse(500, error.message);
    }
  }
}
