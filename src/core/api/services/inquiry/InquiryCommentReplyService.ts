import { Request } from 'express';
import { AppDataSource } from '../../../config/DatabaseConfig';
import { DefaultResponse } from '../../../constant/DefaultResponse';
import { logger } from '../../../utilities/Logger';
import { HttpExceptionResponse } from '../../exception/HttpExceptionResponse';
import { InquiryComment } from '../../../models/entities/InquiryComment';
import { InquiryCommentReplyRepository } from '../../repositories/inquiry/InquiryCommentReplyRepository';
import { InquiryCommentReply } from '../../../models/entities/InquiryCommentReply';
import { InquiryCommentReplyRepositoryImpl } from '../../repositories/implements/inquiry/InquiryCommentReplyRepositoryImpl';
import { InquiryCommentRepository } from '../../repositories/inquiry/InquiryCommentRepository';
import { InquiryCommentRepositoryImpl } from '../../repositories/implements/inquiry/InquiryCommentRepositoryImpl';
import { InquiryCommentReplyQueryBuilderRepository } from '../../repositories/query-builder/InquiryCommentReplyQueryBuilderRepository';
import { InquiryCommentReplyListResponseDto } from '../../../models/dtos/response/inquiry/reply/InquiryCommentReplyListResponseDto';
import { InquiryCommentReplyListRequestDto } from '../../../models/dtos/request/inquiry/reply/InquiryCommentReplyListRequestDto';
import { Page } from '../../../constant/Page';
import { InquiryCommentReplyCreateDto } from '../../../models/dtos/request/inquiry/reply/InquiryCommentReplyCreateDto';
import { InquiryCommentReplyUpdateDto } from '../../../models/dtos/request/inquiry/reply/InquiryCommentReplyUpdateDto';
import { InquiryCommentReplyDeleteRequestDto } from '../../../models/dtos/request/inquiry/reply/InquiryCommentReplyDeleteRequestDto';
import { generatedGuestNickNameUuid } from '../../../utilities/Generater';
import { User } from '../../../models/entities/User';

/**
 * 문의 게시글 댓글의 답글 작성을 담당하는 서비스 클래스입니다.
 *
 * 이 클래스는 특정 댓글에 대해 답글을 등록하는 기능을 제공합니다.
 * 댓글의 존재 여부를 확인하고, 해당 댓글에 연결된 답글을 저장합니다.
 *
 * 주요 메서드:
 * - createInquiryCommentReply(): 특정 댓글에 대한 답글 등록
 *
 * 주의사항:
 * - 댓글이 존재하지 않을 경우 예외를 발생시킵니다.
 * - 답글 저장 실패 시 에러 로그를 기록하고 예외를 던집니다.
 */
export class InquiryCommentReplyService {
  private readonly inquiryCommentRepository: InquiryCommentRepository =
    new InquiryCommentRepositoryImpl();
  private readonly inquiryCommentReplyRepository: InquiryCommentReplyRepository =
    new InquiryCommentReplyRepositoryImpl();

  private readonly inquiryCommentReplyQueryBuilderRepository =
    AppDataSource.getRepository(InquiryCommentReply).extend(
      InquiryCommentReplyQueryBuilderRepository
    );

  /**
   * 특정 댓글에 대한 답글을 등록합니다.
   *
   * @param inquiryId
   * @param inquiryCommentId 답글을 달 댓글의 고유 ID
   * @param inquiryCommentReplyCreateRequestDto 답글 생성 요청 DTO
   * @returns DefaultResponse<number> 등록된 답글의 ID를 포함한 응답 객체
   * @throws Error 댓글이 존재하지 않거나 DB 저장 실패 시 예외 발생
   */
  async createInquiryCommentReply(
    inquiryId: number,
    inquiryCommentId: number,
    inquiryCommentReplyCreateRequestDto: InquiryCommentReplyCreateDto
  ): Promise<DefaultResponse<number>> {
    const user: User | null = inquiryCommentReplyCreateRequestDto.userRequest
      .user
      ? ({
          id: inquiryCommentReplyCreateRequestDto.userRequest.user.id,
          email: inquiryCommentReplyCreateRequestDto.userRequest.user.email,
          nickName: '', // 필요한 경우 데이터베이스에서 조회
          password: '',
          userType: inquiryCommentReplyCreateRequestDto.userRequest.user.role,
          loginAttemptCount: 0,
          blockState: false,
          withdrawnDateTime: null,
        } as User)
      : null;

    if (
      user ||
      (await this.checkDuplicateGuestNickNameUuid(
        inquiryCommentReplyCreateRequestDto.guestNickName,
        this.inquiryCommentReplyRepository
      ))
    ) {
      return DefaultResponse.responseWithData(
        201,
        '문의 게시글 댓글의 답글 작성 성공',
        await this.inquiryCommentReplyRegisterStatusChecker(
          await this.inquiryCommentReplyRepository.save(
            inquiryCommentReplyCreateRequestDto.toEntity(
              user,
              await this.inquiryCommentCheckInDatabase(inquiryCommentId),
              inquiryCommentReplyCreateRequestDto
            )
          ),
          '문의 게시글 댓글의 답글 등록 실패: 데이터베이스 문제 발생'
        )
      );
    }

    throw new HttpExceptionResponse(500, '문의 게시글 댓글의 답글 작성 실패');
  }

  /**
   * 문의 게시글 댓글의 답글 목록을 페이지네이션하여 조회합니다.
   *
   * @returns 페이지네이션된 댓글 목록을 담은 DefaultResponse 객체.
   * @throws Error 데이터베이스 쿼리 실패 시.
   * @param inquiryCommentReplyListRequestDto
   */
  async inquiryCommentReplySearchListWithPaging(
    inquiryCommentReplyListRequestDto: InquiryCommentReplyListRequestDto
  ): Promise<DefaultResponse<InquiryCommentReplyListResponseDto>> {
    const results: [InquiryCommentReply[], number] =
      await this.inquiryCommentReplyQueryBuilderRepository.dynamicQueryPagingByInquiryComment(
        await this.inquiryCommentCheckInDatabase(
          inquiryCommentReplyListRequestDto.inquiryCommentId
        ),
        inquiryCommentReplyListRequestDto
      );

    return DefaultResponse.responseWithPaginationAndData(
      200,
      `게시글 댓글 고유번호: ${inquiryCommentReplyListRequestDto.inquiryCommentId} 답글 목록 조회 성공`,
      new Page<InquiryCommentReplyListResponseDto>(
        inquiryCommentReplyListRequestDto.pageNumber,
        inquiryCommentReplyListRequestDto.perPageSize,
        results[1],
        results[0].map(
          (
            inquiryCommentReply: InquiryCommentReply
          ): InquiryCommentReplyListResponseDto =>
            new InquiryCommentReplyListResponseDto(inquiryCommentReply)
        )
      )
    );
  }

  /**
   * 문의 게시글 댓글의 답글을 수정하는 비동기 함수입니다.
   *
   * 이 함수는 제공된 요청 DTO를 사용하여 문의 게시글 댓글의 답글을 데이터베이스에서 찾고,
   * 내용을 업데이트한 후 데이터베이스에 저장합니다.
   *
   * @param {Request} request - Express 요청 객체 (세션 기반 사용자 정보 포함)
   * @param inquiryCommentReplyUpdateRequestDto 댓글 수정 요청 DTO
   * @returns 수정 성공 여부를 담은 DefaultResponse 객체.
   * @throws HttpExceptionResponse 데이터베이스 관련 오류 발생 시.
   */
  async inquiryCommentReplyUpdate(
    request: Request,
    inquiryCommentReplyUpdateRequestDto: InquiryCommentReplyUpdateDto
  ): Promise<DefaultResponse<number>> {
    const oldInquiryCommentReply: InquiryCommentReply | null =
      await this.inquiryCommentReplyRepository.findByInquiryCommentAndInquiryCommentReplyId(
        (
          await this.inquiryCommentCheckInDatabase(
            inquiryCommentReplyUpdateRequestDto.inquiryCommentId
          )
        ).id,
        inquiryCommentReplyUpdateRequestDto.inquiryCommentReplyId
      );

    if (!oldInquiryCommentReply) {
      throw new HttpExceptionResponse(
        404,
        '수정 대상 답글을 데이터 베이스에서 찾을 수 없는 문제 발생'
      );
    }

    const newInquiryCommentReplyId: number =
      await this.inquiryCommentReplyRepository.save(
        inquiryCommentReplyUpdateRequestDto.toEntity(
          oldInquiryCommentReply,
          inquiryCommentReplyUpdateRequestDto
        )
      );

    return DefaultResponse.responseWithData(
      200,
      '문의 게시글 댓글의 답글 수정 성공',
      await this.inquiryCommentReplyRegisterStatusChecker(
        newInquiryCommentReplyId,
        '문의 게시글 댓글의 답글 수정 실패: 데이터베이스 문제 발생'
      )
    );
  }

  /**
   * 문의 게시글 댓글의 답글을 삭제하는 서비스 메서드입니다.
   *
   * 이 메서드는 주어진 `inquiryCommentId`와 `inquiryCommentReplyId`를 기준으로
   * 해당 답글이 존재하는지 검증한 후, 삭제를 수행하고 결과를 반환합니다.
   *
   * 주요 처리 단계:
   * 1. 댓글 존재 여부 및 답글의 소속 검증
   * 2. 답글 삭제
   * 3. 삭제 상태 확인 후 성공 응답 반환
   *
   * @param {Request} request - Express 요청 객체 (세션 기반 사용자 정보 포함)
   * @param inquiryCommentReplyDeleteRequestDto 답글 삭제 요청 DTO
   * @returns 삭제 결과를 담은 DefaultResponse 객체
   *
   * @throws HttpExceptionResponse - 답글이 존재하지 않거나 삭제에 실패할 경우 예외 발생
   */
  async inquiryCommentReplyDelete(
    request: Request,
    inquiryCommentReplyDeleteRequestDto: InquiryCommentReplyDeleteRequestDto
  ): Promise<DefaultResponse<number>> {
    const inquiryCommentReply: InquiryCommentReply | null =
      await this.inquiryCommentReplyRepository.findByInquiryCommentAndInquiryCommentReplyId(
        (
          await this.inquiryCommentCheckInDatabase(
            inquiryCommentReplyDeleteRequestDto.inquiryCommentId
          )
        ).id,
        inquiryCommentReplyDeleteRequestDto.inquiryCommentReplyId
      );

    if (!inquiryCommentReply) {
      return Promise.reject(
        new HttpExceptionResponse(
          404,
          '삭제 대상 답글을 데이터 베이스에서 찾을 수 없는 문제 발생'
        )
      );
    }

    try {
      return DefaultResponse.responseWithData(
        200,
        '문의 게시글 댓글의 답글 삭제 성공',
        await this.inquiryCommentReplyRegisterStatusChecker(
          await this.inquiryCommentReplyRepository.deleteByInquiryCommentReplyId(
            inquiryCommentReply.id
          ),
          '문의 게시글 댓글의 답글 삭제 실패: 데이터베이스 문제 발생'
        )
      );
    } catch (error: any) {
      logger.error(error.message);

      throw new HttpExceptionResponse(500, error.message);
    }
  }

  /**
   * 문의 게시글의 댓글을 데이터베이스에서 찾습니다.
   *
   * @param inquiryCommentId 문의 게시글의 댓글 ID
   * @returns 문의 게시글 댓글 객체 또는 null (댓글글을 찾을 수 없는 경우).
   * @throws HttpExceptionResponse 문의 게시글의 댓글을 찾을 수 없는 경우.
   */
  private async inquiryCommentCheckInDatabase(
    inquiryCommentId: number
  ): Promise<InquiryComment> {
    const inquiryComment: InquiryComment | null =
      await this.inquiryCommentRepository.findById(inquiryCommentId);

    if (!inquiryComment) {
      return Promise.reject(
        new HttpExceptionResponse(
          400,
          '조회할 댓글 대상 문의 게시글 데이터 베이스에서 찾을 수 없는 문제 발생'
        )
      );
    }

    return inquiryComment;
  }

  /**
   * 댓글의 답글 등록 상태를 확인합니다.
   *
   * @param inquiryCommentReplyId 댓글 답글 ID
   * @param errorMessage 오류 메시지
   * @returns 댓글의 답글 ID
   * @throws HttpExceptionResponse 오류 발생 시.
   */
  private async inquiryCommentReplyRegisterStatusChecker(
    inquiryCommentReplyId: number,
    errorMessage: string
  ): Promise<number> {
    if (!inquiryCommentReplyId) {
      logger.error(errorMessage);
      return Promise.reject(new HttpExceptionResponse(500, errorMessage));
    }

    return inquiryCommentReplyId;
  }

  /**
   * 비회원 댓글의 답글 작성 시 중복되지 않는 닉네임을 생성합니다.
   *
   * @param {string | undefined} guestNickName - 최초 생성된 비회원 닉네임 (UUID 기반)
   * @param {InquiryCommentRepository} inquiryCommentReplyRepository - 닉네임 중복 조회를 위한 답글 레포지토리
   * @returns {Promise<boolean>} 중복되지 않는 닉네임이면 true 반환
   *
   * @throws {HttpExceptionResponse} 닉네임이 1000회 반복 생성에도 중복될 경우 예외 발생
   *
   * @description
   * - 댓글 등록 시 UUID 기반으로 생성된 닉네임이 기존 댓글과 중복되지 않는지 확인합니다.
   * - 중복될 경우 새로운 닉네임을 생성하여 중복되지 않을 때까지 재시도합니다.
   * - 최대 1000회 반복 후에도 중복될 경우 서버 오류로 간주하고 예외 처리합니다.
   *
   * @example
   * const isValid = await this.checkDuplicateGuestNickNameUuid('익명2940', this.inquiryCommentRepository);
   * if (!isValid) {
   *   throw new Error('비회원 닉네임 중복 확인 실패');
   * }
   */
  private async checkDuplicateGuestNickNameUuid(
    guestNickName: string | undefined,
    inquiryCommentReplyRepository: InquiryCommentReplyRepository
  ): Promise<boolean> {
    if (!guestNickName || !inquiryCommentReplyRepository) {
      throw new Error(
        `[InquiryCommentReplyService - checkDuplicateGuestNickNameUuid] 매개 변수값 확인 필요`
      );
    }

    let loopCount: number = 0;

    const triedNicknames = new Set<string>();

    while (loopCount < 1000) {
      logger.info(
        `[createInquiryCommentReply - checkDuplicateGuestNickNameUuid] ${loopCount} 번째 검증 시작`
      );

      if (triedNicknames.has(guestNickName)) {
        guestNickName = generatedGuestNickNameUuid();

        logger.info(
          `[createInquiryCommentReply - checkDuplicateGuestNickNameUuid] guestNickName: ${guestNickName}`
        );

        continue;
      }

      triedNicknames.add(guestNickName);

      const inquiryCommentReply: InquiryCommentReply | null =
        await inquiryCommentReplyRepository.findByGuestNickName(guestNickName);

      if (!inquiryCommentReply) {
        return true;
      }

      logger.info(
        `[createInquiryCommentReply - checkDuplicateGuestNickNameUuid] writer: ${inquiryCommentReply.guestNickName}`
      );

      loopCount++;
    }

    logger.error(`문의 게시글 댓글의 답글 등록 중 비회원 닉네임 생성 실패`);
    throw new HttpExceptionResponse(500, `문의 게시글 댓글의 답글 등록 실패`);
  }
}
