import { Request } from 'express';
import { AppDataSource } from '../../../config/DatabaseConfig';
import { InquiryComment } from '../../../models/entities/InquiryComment';
import {
  InquiryCommentQueryBuilderRepository,
} from '../../repositories/query-builder/InquiryCommentQueryBuilderRepository';
import {
  InquiryCommentCreateRequestDto,
} from '../../../models/dtos/request/inquiry/comment/InquiryCommentCreateRequestDto';
import { DefaultResponse } from '../../../constant/DefaultResponse';
import {
  InquiryCommentListRequestDto,
} from '../../../models/dtos/request/inquiry/comment/InquiryCommentListRequestDto';
import {
  InquiryCommentListResponseDto,
} from '../../../models/dtos/response/inquiry/comment/InquiryCommentListResponseDto';
import { Page } from '../../../constant/Page';
import {
  InquiryCommentUpdateRequestDto,
} from '../../../models/dtos/request/inquiry/comment/InquiryCommentUpdateRequestDto';
import { HttpExceptionResponse } from '../../exception/HttpExceptionResponse';
import {
  InquiryCommentDeleteRequestDto,
} from '../../../models/dtos/request/inquiry/comment/InquiryCommentDeleteRequestDto';
import { logger } from '../../../utilities/Logger';
import { Inquiry } from '../../../models/entities/Inquiry';
import { InquiryRepository } from '../../repositories/inquiry/InquiryRepository';
import { InquiryRepositoryImpl } from '../../repositories/implements/inquiry/InquiryRepositoryImpl';
import { InquiryCommentRepository } from '../../repositories/inquiry/InquiryCommentRepository';
import { InquiryCommentRepositoryImpl } from '../../repositories/implements/inquiry/InquiryCommentRepositoryImpl';
import { findBySessionUserId } from '../../../utilities/Finder';
import { generatedGuestNickNameUuid } from '../../../utilities/Generater';
import { User } from '../../../models/entities/User';

/**
 * 문의 게시글 댓글 서비스 로직을 담당하는 클래스입니다.
 *
 * 이 클래스는 특정 문의 게시글에 댓글을 등록하는 기능을 제공합니다.
 * 데이터베이스 접근은 InquiryCommentRepository를 통해 수행됩니다.
 *
 * 주요 기능:
 * - createInquiryComment: 댓글 저장 및 ID 반환
 *
 * 주의사항:
 * - 댓글 저장 실패 시 로깅 후 예외를 발생시킵니다.
 * - 성공 시 응답은 DefaultResponse 형식으로 ID를 포함합니다.
 */
export class InquiryCommentService {
  private readonly inquiryRepository: InquiryRepository = new InquiryRepositoryImpl();
  private readonly inquiryCommentRepository: InquiryCommentRepository =
    new InquiryCommentRepositoryImpl();

  private readonly inquiryCommentQueryBuilderRepository = AppDataSource.getRepository(
    InquiryComment
  ).extend(InquiryCommentQueryBuilderRepository);

  /**
   * 댓글 작성 처리
   *
   * @param {Request} request - Express 요청 객체 (세션 기반 사용자 정보 포함)
   * @param inquiryId 문의 게시글 고유 번호
   * @param inquiryCommentCreateRequestDto - 댓글 등록 요청 DTO
   * @returns 댓글 등록 성공 시 ID를 포함한 DefaultResponse 반환
   * @throws 저장 실패 시 에러 발생 및 로깅
   */
  async createInquiryComment(
    inquiryId: number,
    inquiryCommentCreateRequestDto: InquiryCommentCreateRequestDto
  ): Promise<DefaultResponse<number>> {
    const user: User | null = await findBySessionUserId(inquiryCommentCreateRequestDto.userRequest);

    if (
      user ||
      (await this.checkDuplicateGuestNickNameUuid(
        inquiryCommentCreateRequestDto.guestNickName,
        this.inquiryCommentRepository
      ))
    ) {
      return DefaultResponse.responseWithData(
        201,
        '문의 게시글 댓글 작성 성공',
        await this.inquiryCommentRegisterStatusChecker(
          await this.inquiryCommentRepository.save(
            inquiryCommentCreateRequestDto.toEntity(
              user,
              await this.inquiryCheckInDatabase(inquiryId),
              inquiryCommentCreateRequestDto
            )
          ),
          '문의 게시글 댓글 등록 실패: 데이터베이스 문제 발생'
        )
      );
    }

    throw new HttpExceptionResponse(500, '문의 게시글 댓글 작성 실패');
  }

  /**
   * 문의 게시글 댓글 목록을 페이지네이션하여 조회합니다.
   *
   * @returns 페이지네이션된 댓글 목록을 담은 DefaultResponse 객체.
   * @throws Error 데이터베이스 쿼리 실패 시.
   * @param inquiryCommentListRequestDto 댓글 목록 조회 요청 DTO
   */
  async inquiryCommentSearchListWithPaging(
    inquiryCommentListRequestDto: InquiryCommentListRequestDto
  ): Promise<DefaultResponse<InquiryCommentListResponseDto>> {
    const results: [InquiryComment[], number] =
      await this.inquiryCommentQueryBuilderRepository.dynamicQueryPagingByInquiry(
        await this.inquiryCheckInDatabase(inquiryCommentListRequestDto.inquiryId),
        inquiryCommentListRequestDto
      );

    return DefaultResponse.responseWithPaginationAndData(
      200,
      `게시글 고유번호: ${inquiryCommentListRequestDto.inquiryId} 댓글 목록 조회 성공`,
      new Page<InquiryCommentListResponseDto>(
        inquiryCommentListRequestDto.pageNumber,
        inquiryCommentListRequestDto.perPageSize,
        results[1],
        results[0].map(
          (inquiryComment: InquiryComment): InquiryCommentListResponseDto =>
            new InquiryCommentListResponseDto(inquiryComment)
        )
      )
    );
  }

  /**
   * 문의 게시글의 댓글을 수정하는 비동기 함수입니다.
   *
   * 이 함수는 제공된 요청 DTO를 사용하여 문의 게시글의 댓글을 데이터베이스에서 찾고,
   * 내용을 업데이트한 후 데이터베이스에 저장합니다.
   *
   * @param {Request} request - Express 요청 객체 (세션 기반 사용자 정보 포함)
   * @param inquiryCommentUpdateRequestDto 댓글 수정 요청 DTO
   * @returns 수정 성공 여부를 담은 DefaultResponse 객체.
   * @throws HttpExceptionResponse 데이터베이스 관련 오류 발생 시.
   */
  async inquiryCommentUpdate(
    request: Request,
    inquiryCommentUpdateRequestDto: InquiryCommentUpdateRequestDto
  ): Promise<DefaultResponse<number>> {
    const oldInquiryComment: InquiryComment | null =
      await this.inquiryCommentRepository.findByInquiryAndInquiryCommentId(
        (await this.inquiryCheckInDatabase(inquiryCommentUpdateRequestDto.inquiryId)).id,
        inquiryCommentUpdateRequestDto.inquiryCommentId
      );

    if (!oldInquiryComment) {
      return Promise.reject(
        new HttpExceptionResponse(404, '수정 대상 댓글을 데이터 베이스에서 찾을 수 없는 문제 발생')
      );
    }

    const newInquiryCommentId: number = await this.inquiryCommentRepository.save(
      inquiryCommentUpdateRequestDto.toEntity(oldInquiryComment, inquiryCommentUpdateRequestDto)
    );

    return DefaultResponse.responseWithData(
      200,
      '문의 게시글 댓글 수정 성공',
      await this.inquiryCommentRegisterStatusChecker(
        newInquiryCommentId,
        '문의 게시글 댓글 수정 실패: 데이터베이스 문제 발생'
      )
    );
  }

  /**
   * 문의 게시글의 댓글을 삭제합니다.
   *
   * @param {Request} request - Express 요청 객체 (세션 기반 사용자 정보 포함)
   * @param inquiryCommentDeleteRequestDto 삭제 요청 DTO.
   * @retuuurns 삭제 성공 여부를 담은 DefaultResponse 객체.
   * @throws HttpExceptionResponse 댓글을 찾을 수 없거나 삭제에 실패한 경우.
   */
  async deletedInquiryComment(
    request: Request,
    inquiryCommentDeleteRequestDto: InquiryCommentDeleteRequestDto
  ): Promise<DefaultResponse<number>> {
    const inquiryComment: InquiryComment | null =
      await this.inquiryCommentRepository.findByInquiryAndInquiryCommentId(
        (await this.inquiryCheckInDatabase(inquiryCommentDeleteRequestDto.inquiryId)).id,
        inquiryCommentDeleteRequestDto.inquiryCommentId
      );

    if (!inquiryComment) {
      return Promise.reject(
        new HttpExceptionResponse(404, '삭제 대상 댓글을 데이터 베이스에서 찾을 수 없는 문제 발생')
      );
    }

    try {
      return DefaultResponse.responseWithData(
        200,
        '문의 게시글 댓글 삭제 성공',
        await this.inquiryCommentRegisterStatusChecker(
          await this.inquiryCommentRepository.delectByInquiryCommentId(inquiryComment.id),
          '문의 게시글 댓글 삭제 실패: 데이터베이스 문제 발생'
        )
      );
    } catch (error: any) {
      logger.error(error.message);

      throw new HttpExceptionResponse(500, error.message);
    }
  }

  /**
   * 문의 게시글 데이터베이스에서 찾습니다.
   *
   * @param inquiryId 문의 게시글 ID
   * @returns 문의 게시글 객체 또는 null (게시글을 찾을 수 없는 경우).
   * @throws HttpExceptionResponse 문의 게시글을 찾을 수 없는 경우.
   */
  private async inquiryCheckInDatabase(inquiryId: number): Promise<Inquiry> {
    const inquiry: Inquiry | null = await this.inquiryRepository.findById(inquiryId);

    if (!inquiry) {
      return Promise.reject(
        new HttpExceptionResponse(
          400,
          '조회할 댓글 대상 문의 게시글 데이터 베이스에서 찾을 수 없는 문제 발생'
        )
      );
    }

    return inquiry;
  }

  /**
   * 댓글 등록 상태를 확인합니다.
   *
   * @param inquiryCommentId 댓글 ID
   * @param errorMessage 오류 메시지
   * @returns 댓글 ID
   * @throws HttpExceptionResponse 오류 발생 시.
   */
  private async inquiryCommentRegisterStatusChecker(
    inquiryCommentId: number,
    errorMessage: string
  ): Promise<number> {
    if (!inquiryCommentId) {
      logger.error(errorMessage);
      throw new HttpExceptionResponse(500, errorMessage);
    }

    return inquiryCommentId;
  }

  /**
   * 비회원 댓글 작성 시 중복되지 않는 닉네임을 생성합니다.
   *
   * @param {string | undefined} guestNickName - 최초 생성된 비회원 닉네임 (UUID 기반)
   * @param {InquiryCommentRepository} inquiryCommentRepository - 닉네임 중복 조회를 위한 댓글 레포지토리
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
    inquiryCommentRepository: InquiryCommentRepository
  ): Promise<boolean> {
    if (!guestNickName || !inquiryCommentRepository) {
      throw new Error(
        `[InquiryCommentService - checkDuplicateGuestNickNameUuid] 매개 변수값 확인 필요`
      );
    }

    let loopCount: number = 0;

    const triedNicknames = new Set<string>();

    while (loopCount < 1000) {
      logger.info(
        `[createInquiryComment - checkDuplicateGuestNickNameUuid] ${loopCount} 번째 검증 시작`
      );

      if (triedNicknames.has(guestNickName)) {
        guestNickName = generatedGuestNickNameUuid();

        logger.info(
          `[createInquiryComment - checkDuplicateGuestNickNameUuid] guestNickName: ${guestNickName}`
        );

        continue;
      }

      triedNicknames.add(guestNickName);

      const inquiryComment: InquiryComment | null =
        await inquiryCommentRepository.findByGuestNickName(guestNickName);

      if (!inquiryComment) {
        return true;
      }

      logger.info(
        `[createInquiryComment - checkDuplicateGuestNickNameUuid] writer: ${inquiryComment.guestNickName}`
      );

      loopCount++;
    }

    logger.error(`문의 게시글 댓글 등록 중 비회원 닉네임 생성 실패`);
    throw new HttpExceptionResponse(500, `문의 게시글 댓글 등록 실패`);
  }
}
