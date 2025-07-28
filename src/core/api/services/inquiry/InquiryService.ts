import { Request } from 'express';
import { ApplicationFileRepositoryImpl } from '../../repositories/implements/ApplicationFileRepositoryImpl';
import { AppDataSource } from '../../../config/DatabaseConfig';
import { Inquiry } from '../../../models/entities/Inquiry';
import { InquiryQueryBuilderRepository } from '../../repositories/query-builder/InquiryQueryBuilderRepository';
import { InquiryCreateRequestDto } from '../../../models/dtos/request/inquiry/InquiryCreateRequestDto';
import { DefaultResponse } from '../../../constant/DefaultResponse';
import { InquiryCreateResponseDto } from '../../../models/dtos/response/inquiry/InquiryCreateResponseDto';
import { HttpExceptionResponse } from '../../exception/HttpExceptionResponse';
import { ApplicationFile } from '../../../models/entities/common/ApplicationFile';
import { InquiryFileResponseDto } from '../../../models/dtos/response/inquiry/InquiryFileResponseDto';
import { InquirySearchRequestDto } from '../../../models/dtos/request/inquiry/InquirySearchRequestDto';
import { InquiryListResponseDto } from '../../../models/dtos/response/inquiry/InquiryListResponseDto';
import { Page } from '../../../constant/Page';
import { InquiryRepository } from '../../repositories/inquiry/InquiryRepository';
import { InquiryRepositoryImpl } from '../../repositories/implements/inquiry/InquiryRepositoryImpl';
import { InquiryDetailSearchRequestDto } from '../../../models/dtos/request/inquiry/InquiryDetailSearchRequestDto';
import { InquiryDetailResponseDto } from '../../../models/dtos/response/inquiry/InquiryDetailResponseDto';
import { checkPassword } from '../../../utilities/Checker';
import { InquiryUpdateRequestDto } from '../../../models/dtos/request/inquiry/InquiryUpdateRequestDto';
import path from 'node:path';
import { unlink } from 'fs/promises';
import { logger } from '../../../utilities/Logger';
import { InquiryFileUpdateResponseDto } from '../../../models/dtos/response/inquiry/InquiryFileUpdateResponseDto';
import { InquiryUpdateResponseDto } from '../../../models/dtos/response/inquiry/InquiryUpdateResponseDto';
import { ApplicationFileRepository } from '../../repositories/ApplicationFileRepository';
import { fileCleanerAsync } from '../../../utilities/Cleaner';
import { AdminInquiryAnswerStatusUpdateDto } from '../../../models/dtos/request/inquiry/AdminInquiryAnswerStatusUpdateDto';
import { User } from '../../../models/entities/User';
import { generatedGuestNickNameUuid } from '../../../utilities/Generater';
import { validateGuestPasswordCookie } from '../../../utilities/Cookie';
import { decryptGuestPassword } from '../../../utilities/Encyprter';
import { JobType, UserRole } from '../../../types/Enum';

/**
 * 문의 게시판 서비스 로직을 담당하는 클래스입니다.
 *
 * 이 클래스는 문의 등록 및 조건 검색 기반의 문의 목록 조회 기능을 제공합니다.
 * 데이터베이스 접근은 InquiryRepository 및 QueryBuilder, 파일 저장은 ApplicationFileRepository를 통해 수행됩니다.
 *
 * 주요 기능:
 * - createdInquiry: 문의 게시글 및 첨부 파일 저장
 * - getInquiryListWithSearch: 조건 기반 페이징 조회
 *
 * 주의사항:
 * - 파일 저장은 실제 파일이 아닌 메타데이터만 DB에 저장됩니다.
 * - 저장된 파일 정보는 응답 DTO에 요약 형태로 포함됩니다.
 */
export class InquiryService {
  private readonly inquiryRepository: InquiryRepository =
    new InquiryRepositoryImpl();
  private readonly applicationFileRepository: ApplicationFileRepository =
    new ApplicationFileRepositoryImpl();

  private readonly inquiryQueryBuilderRepository = AppDataSource.getRepository(
    Inquiry
  ).extend(InquiryQueryBuilderRepository);

  /**
   * 문의 게시글을 생성하고 첨부 파일 정보를 함께 저장합니다.
   *
   * @param inquiryCreatedRequestDto 게시글 작성 요청 DTO
   * @param files Multer로 전달된 업로드 파일 배열
   * @returns 생성된 게시글 ID 및 저장된 파일 정보가 포함된 응답 DTO
   *
   * @throws Error 게시글 저장 실패 시 예외 발생
   */
  async createInquiry(
    inquiryCreatedRequestDto: InquiryCreateRequestDto,
    files: Express.Multer.File[]
  ): Promise<DefaultResponse<InquiryCreateResponseDto>> {
    const user: User | null = inquiryCreatedRequestDto.userRequest.user
      ? ({
          id: inquiryCreatedRequestDto.userRequest.user.id,
          email: inquiryCreatedRequestDto.userRequest.user.email,
          nickName: '', // 필요한 경우 데이터베이스에서 조회
          password: '',
          userType: inquiryCreatedRequestDto.userRequest.user.role,
          loginAttemptCount: 0,
          blockState: false,
          withdrawnDateTime: null,
        } as User)
      : null;

    if (
      user ||
      (inquiryCreatedRequestDto.guestPassword &&
        (await this.checkDuplicateGuestNickNameUuid(
          inquiryCreatedRequestDto.guestNickName,
          this.inquiryRepository
        )))
    ) {
      const inquiryId: number = await this.inquiryRepository.save(
        inquiryCreatedRequestDto.toEntity(user, inquiryCreatedRequestDto)
      );

      if (!inquiryId || inquiryId <= 0) {
        const errorMessage = `문의 게시글 등록 실패 데이터 베이스 문제 발생`;

        return Promise.reject(new HttpExceptionResponse(500, errorMessage));
      }

      const applicationFiles: ApplicationFile[] = files.map((file) => {
        const applicationFile = new ApplicationFile();
        applicationFile.relatedId = inquiryId;
        applicationFile.originalName = file.originalname;
        applicationFile.path = file.path;
        applicationFile.fileType = file.mimetype.startsWith('image/')
          ? 'image'
          : file.mimetype.startsWith('video/')
            ? 'video'
            : 'document';
        applicationFile.mimeType = file.mimetype;
        applicationFile.size = file.size;

        return applicationFile;
      });

      const saveFileInformation =
        await this.applicationFileRepository.saveAll(applicationFiles);

      const savedFileResponseDtos: InquiryFileResponseDto[] =
        saveFileInformation.map(
          (file) =>
            new InquiryFileResponseDto({
              id: file.id,
              path: file.path,
              originalName: file.originalName,
            })
        );

      return DefaultResponse.responseWithData(
        201,
        '문의 게시글 작성 성공',
        new InquiryCreateResponseDto(inquiryId, savedFileResponseDtos)
      );
    }

    throw new HttpExceptionResponse(500, '문의 게시글 작성 실패');
  }

  /**
   * 조건 기반으로 문의 목록을 조회합니다.
   *
   * @param inquirySearchRequestDto 검색 조건 및 페이징 정보가 포함된 DTO
   * @returns 조회된 목록과 페이징 정보를 포함한 DefaultResponse
   */
  async getInquiryListWithSearch(
    inquirySearchRequestDto: InquirySearchRequestDto
  ): Promise<DefaultResponse<InquiryListResponseDto>> {
    const results: [Inquiry[], number] =
      await this.inquiryQueryBuilderRepository.dynamicQuerySearchAndPagingByDto(
        inquirySearchRequestDto
      );

    return DefaultResponse.responseWithPaginationAndData(
      200,
      '문의 목록 조회 성공',
      new Page<InquiryListResponseDto>(
        inquirySearchRequestDto.pageNumber,
        inquirySearchRequestDto.perPageSize,
        results[1],
        results[0].map(
          (inquiry: Inquiry): InquiryListResponseDto =>
            new InquiryListResponseDto(inquiry)
        )
      )
    );
  }

  /**
   * 비회원 문의 게시글 비밀번호를 검증합니다.
   *
   * 입력된 비밀번호와 DB에 저장된 비밀번호가 일치하는지 확인합니다.
   *
   * - 저장된 문의 게시글 중 입력 비밀번호와 일치하는 것이 없으면 예외를 발생시킵니다.
   * - 비밀번호는 해시된 값을 비교합니다.
   *
   * @param inquiryId - 상세 조회 대상 문의 게시글 고유 번호
   * @param guestPassword - 사용자가 입력한 비회원 비밀번호
   * @returns 비밀번호 검증 성공 여부를 담은 DefaultResponse<boolean> 객체 (true 반환)
   * @throws HttpExceptionResponse - 비밀번호가 틀릴 경우 400 예외 발생
   */
  async checkInquiryGuestPassword(
    inquiryId: number,
    guestPassword: string
  ): Promise<DefaultResponse<boolean>> {
    const inquiry: Inquiry | null =
      await this.inquiryRepository.findById(inquiryId);

    if (
      !(
        inquiry?.guestPassword &&
        (await checkPassword(guestPassword, inquiry.guestPassword))
      )
    ) {
      return Promise.reject(
        new HttpExceptionResponse(
          400,
          '문의 게시글 고유 번호 혹은 비밀번호 확인 필요'
        )
      );
    }

    return DefaultResponse.responseWithData(
      200,
      '비회원 비밀번호 검증 성공',
      true
    );
  }

  /**
   * 문의 상세 정보를 조회합니다.
   *
   * @param {Request} request - Express 요청 객체 (세션 기반 사용자 정보 포함)
   * @param {InquiryDetailSearchRequestDto} inquiryDetailSearchRequestDto - 조회 조건 DTO
   * @returns {Promise<DefaultResponse<InquiryDetailResponseDto>>} 조회된 문의 상세 응답
   *
   * @description
   * - 회원 또는 비회원의 세션 정보를 기준으로 작성자 본인 여부를 판별합니다.
   * - `processType` 값이 true인 경우, 댓글 및 답글 정보도 포함하여 조회합니다.
   * - 비회원일 경우, 요청에 `validateGuestPassword` 값이 없으면 예외를 발생시킵니다.
   *
   * @throws {HttpExceptionResponse}
   * - 비회원이 본인의 비밀번호를 제공하지 않은 경우 (400)
   * - 작성자가 아닌 사용자가 접근하는 경우 (400)
   *
   * @example
   * GET /inquiry/detail
   * {
   *   "inquiryId": 3,
   *   "processType": true,
   *   "validateGuestPassword": true
   * }
   *
   * 응답:
   * {
   *   "statusCode": 200,
   *   "message": "문의 상세 조회 성공",
   *   "data": {
   *     "inquiryId": 3,
   *     "title": "...",
   *     "content": "...",
   *     "writer": "...",
   *     ...
   *   }
   * }
   */
  async getDetailInquiry(
    request: Request,
    inquiryDetailSearchRequestDto: InquiryDetailSearchRequestDto
  ): Promise<DefaultResponse<InquiryDetailResponseDto>> {
    let result: InquiryDetailResponseDto;

    if (!(await this.checkAuthorization(request, JobType.READ))) {
      logger.error(`접근 권한 없는 접근 발생`);

      return Promise.reject(
        new HttpExceptionResponse(401, '본인이 작성한 글만 확인 가능')
      );
    }

    if (!inquiryDetailSearchRequestDto.processType) {
      result = await this.getDetailInquiryWithFiles(
        inquiryDetailSearchRequestDto.inquiryId
      );
    } else {
      result = await this.getDetailInquiryWithFilesAndCommentReply(
        inquiryDetailSearchRequestDto.inquiryId
      );
    }

    return DefaultResponse.responseWithData(200, '문의 상세 조회 성공', result);
  }

  /**
   * 문의 게시글을 수정하고, 첨부된 파일도 갱신하는 서비스 로직입니다.
   *
   * 주요 처리 절차:
   * 1. 전달받은 ID로 기존 문의 게시글을 조회합니다.
   * 2. DTO로부터 새로운 엔티티를 생성한 뒤 병합하여 게시글을 수정합니다.
   * 3. 기존 파일을 삭제하고, 새 파일을 저장합니다.
   * 4. 최종적으로 수정된 게시글 ID와 새 파일 정보를 포함한 응답 DTO를 반환합니다.
   *
   * 주의사항:
   * - 파일 삭제는 비동기 처리되며, 실패해도 전체 트랜잭션에 영향을 주지 않습니다.
   * - `deleteOldApplicationFile`과 `createNewApplicationFile`은 내부에서 파일 시스템 연동이 필요할 수 있습니다.
   *
   * @param {Request} request - Express 요청 객체 (세션 기반 사용자 정보 포함)
   * @param inquiryUpdateRequestDto - 수정 요청 데이터(DTO)
   * @param files - 새로 업로드된 파일 목록(Multer File[])
   * @returns 수정된 게시글 ID 및 첨부파일 정보를 담은 응답 객체
   */
  async updateInquiry(
    request: Request,
    inquiryUpdateRequestDto: InquiryUpdateRequestDto,
    files: Express.Multer.File[]
  ): Promise<DefaultResponse<InquiryUpdateResponseDto>> {
    if (!(await this.checkAuthorization(request, JobType.UPDATE))) {
      logger.error(`접근 권한 없는 접근 발생`);

      return Promise.reject(
        new HttpExceptionResponse(401, '본인이 작성한 글만 수정 가능')
      );
    }

    const oldInquiry: Inquiry = this.checkInquiry(
      await this.inquiryRepository.findById(inquiryUpdateRequestDto.inquiryId)
    );

    const newInquiry: Inquiry = await this.inquiryRepository.update(
      oldInquiry,
      inquiryUpdateRequestDto.toEntity(inquiryUpdateRequestDto)
    );

    if (!newInquiry) {
      throw new HttpExceptionResponse(500, '게시글 수정 간 문제 발생');
    }

    return DefaultResponse.responseWithData(
      200,
      '문의 게시글 수정 성공',
      new InquiryUpdateResponseDto(
        newInquiry.id,
        await this.createNewApplicationFile(
          files,
          newInquiry,
          this.deleteOldApplicationFile(
            inquiryUpdateRequestDto.deleteInquiryFileIds
          )
        )
      )
    );
  }

  /**
   * 관리자 문의 게시글의 답변 상태를 수정합니다.
   *
   * 이 메서드는 지정된 문의 게시글 ID를 기반으로 게시글을 조회한 후,
   * `답변 완료`, `미답변` 등의 상태를 갱신합니다.
   *
   * 주요 처리 단계:
   * 1. 게시글 ID로 기존 Inquiry를 조회합니다.
   * 2. DTO를 통해 생성한 변경 데이터를 merge하여 저장합니다.
   * 3. 수정된 게시글의 ID를 포함하여 응답을 반환합니다.
   *
   * @param adminInquiryAnswerStatusUpdateDto 관리자 답변 상태 수정 요청 DTO
   * @returns 수정된 Inquiry의 ID를 포함하는 응답 객체
   *
   * @throws {HttpExceptionResponse} 게시글이 존재하지 않거나, 저장 중 에러가 발생한 경우
   */
  async adminInquiryAnswerStatusUpdate(
    adminInquiryAnswerStatusUpdateDto: AdminInquiryAnswerStatusUpdateDto
  ): Promise<
    DefaultResponse<{
      id: number;
    }>
  > {
    return DefaultResponse.responseWithData(
      200,
      '관리자 문의 게시글 답변 상태 수정 성공',
      {
        id: (
          await this.inquiryRepository.update(
            this.checkInquiry(
              await this.inquiryRepository.findById(
                adminInquiryAnswerStatusUpdateDto.inquiryId
              )
            ),
            adminInquiryAnswerStatusUpdateDto.toEntity(
              adminInquiryAnswerStatusUpdateDto
            )
          )
        ).id,
      }
    );
  }

  /**
   * 특정 ID를 가진 문의 게시글 및 관련 데이터(파일, 댓글, 댓글의 답글)를 삭제하는 메서드입니다.
   *
   * 주요 기능:
   * - 게시글 존재 여부를 확인합니다.
   * - 게시글에 연결된 댓글 및 답글, 첨부파일을 모두 삭제합니다.
   * - 삭제된 엔티티들의 ID 리스트를 포함한 응답 객체를 반환합니다.
   *
   * 예외 처리:
   * - 존재하지 않는 게시글인 경우 404 예외를 발생시킵니다.
   * - 삭제 중 오류 발생 시 500 예외를 발생시킵니다.
   *
   * 로그 처리:
   * - 오류 발생 시 에러 메시지를 로깅합니다.
   *
   * @param {Request} request - Express 요청 객체 (세션 기반 사용자 정보 포함)
   * @param inquiryId 삭제할 문의 게시글 ID
   * @param validateGuestPassword 비회원 문의 게시글 작성 비밀번호 검증 여부
   * @returns 삭제된 항목들의 ID 정보를 포함한 DefaultResponse 객체
   * @throws HttpExceptionResponse 게시글이 존재하지 않거나 삭제 중 오류 발생 시
   */
  async deleteInquiry(
    request: Request,
    inquiryId: number
  ): Promise<
    DefaultResponse<{
      id: number;
      deleteByInquiryFile: { ids: number[] };
    }>
  > {
    try {
      if (!(await this.checkAuthorization(request, JobType.DELETE))) {
        logger.error(`접근 권한 없는 접근 발생`);

        return Promise.reject(
          new HttpExceptionResponse(401, '본인이 작성한 글만 삭제 가능')
        );
      }

      const inquiry: Inquiry = this.checkInquiry(
        await this.inquiryRepository.findById(inquiryId)
      );
      const deleteInquiryFileIds: number[] =
        await this.deleteInquiryFiles(inquiry);
      const deleteByInquiryId: number = await this.inquiryRepository.deleteById(
        inquiry.id
      );

      return DefaultResponse.responseWithData(200, '문의 게시글 삭제 성공', {
        id: deleteByInquiryId,
        deleteByInquiryFile: {
          ids: deleteInquiryFileIds,
        },
      });
    } catch (error: any) {
      if (error instanceof HttpExceptionResponse) {
        logger.error(
          `문의 게시글 삭제 간 문제 발생 - 문제 내용: ${error.message}`
        );

        throw new HttpExceptionResponse(error.statusCode, error.message);
      } else {
        logger.error(
          `문의 게시글 삭제 간 문제 발생 - 문제 내용: ${error.message}`
        );

        throw new HttpExceptionResponse(500, '내부 서버 문제 발생');
      }
    }
  }

  /**
   * 댓글 및 답글을 제외한 문의 본문 및 첨부파일만 조회합니다.
   *
   * @param inquiryId - 조회할 문의 고유 ID
   * @returns InquiryDetailResponseDto
   * @throws HttpExceptionResponse - 문의 데이터를 찾을 수 없는 경우
   */
  private async getDetailInquiryWithFiles(
    inquiryId: number
  ): Promise<InquiryDetailResponseDto> {
    const inquiry: Inquiry = this.checkInquiry(
      await this.inquiryRepository.findInquiryWithUserByInquiryId(inquiryId)
    );
    return new InquiryDetailResponseDto(
      inquiry,
      await this.applicationFileRepository.findByRelatedId(inquiry.id)
    );
  }

  /**
   * 댓글 및 답글까지 포함한 전체 문의 상세 정보를 조회합니다.
   *
   * @param inquiryId - 조회할 문의 고유 ID
   * @returns InquiryDetailResponseDto
   * @throws HttpExceptionResponse - 문의 데이터를 찾을 수 없는 경우
   */
  private async getDetailInquiryWithFilesAndCommentReply(
    inquiryId: number
  ): Promise<InquiryDetailResponseDto> {
    const inquiry: Inquiry = this.checkInquiry(
      await this.inquiryQueryBuilderRepository.getDetailInquiryWithCommentAndCommentReply(
        inquiryId
      )
    );

    return new InquiryDetailResponseDto(
      inquiry,
      await this.applicationFileRepository.findByRelatedId(inquiry.id)
    );
  }

  /**
   * 조회한 문의가 null인 경우 예외를 발생시키고, 정상 데이터인 경우 그대로 반환합니다.
   *
   * @param inquiry - 조회된 문의 엔티티
   * @returns 유효성 검사 통과된 Inquiry 객체
   * @throws HttpExceptionResponse - null일 경우 예외 발생
   */
  private checkInquiry(inquiry: Inquiry | null): Inquiry {
    if (!inquiry) {
      throw new HttpExceptionResponse(404, '문의 게시글 조회 실패');
    }

    return inquiry;
  }

  /**
   * 기존 문의 게시글에 첨부된 파일을 삭제하는 메서드입니다.
   *
   * 주요 처리 절차:
   * 1. 전달받은 파일 ID로 파일 경로를 조회합니다.
   * 2. 파일 시스템에서 실제 파일을 삭제합니다.
   * 3. DB에서도 해당 파일 메타데이터를 삭제하고 삭제된 ID 목록을 반환합니다.
   *
   * 주의사항:
   * - 파일이 하나라도 삭제 실패 시 전체 요청은 예외를 던지며 중단됩니다.
   * - 삭제 성공 여부는 반환되는 ID 배열로 판단할 수 있습니다.
   *
   * @param inquiryFileIds 삭제 대상 파일 ID 배열
   * @returns 삭제된 파일 ID 목록 또는 undefined
   * @throws HttpExceptionResponse 파일 시스템 삭제 실패 시
   */
  private async deleteOldApplicationFile(
    inquiryFileIds: number[] | undefined
  ): Promise<number[] | undefined> {
    if (inquiryFileIds?.length) {
      for (const file of await this.applicationFileRepository.findByIds(
        inquiryFileIds
      )) {
        try {
          if (!(await fileCleanerAsync(file.path))) {
            return Promise.reject(
              new HttpExceptionResponse(
                500,
                `문의 게시글 수정 간 기존 파일 삭제 실패`
              )
            );
          }
          await unlink(path.resolve(file.path));
        } catch (error: any) {
          logger.error(
            `문의 게시글 수정 간 ${file.path} 파일 삭제 실패 - 실패 이유: ${error.message}`
          );

          return Promise.reject(
            new HttpExceptionResponse(
              500,
              `문의 게시글 수정 간 기존 파일 삭제 실패`
            )
          );
        }
      }

      const idsToDelete: number[] =
        await this.applicationFileRepository.deleteByIds(inquiryFileIds);

      if (!idsToDelete.length) {
        logger.error(
          `문의 게시글 수정 간 데이터 베이스 파일 정보 삭제 실패 - 실패 이유: 데이터 베이스 삭제 처리 뒤 반환된 ID 값들: ${idsToDelete}`
        );
      }

      return idsToDelete;
    }
  }

  /**
   * 새로 업로드된 파일들을 DB에 저장하고 응답 DTO로 변환합니다.
   *
   * 주요 처리 절차:
   * 1. 전달받은 Multer 파일 배열을 기반으로 ApplicationFile 엔티티를 생성합니다.
   * 2. DB에 저장한 후, 저장된 결과를 응답 DTO 배열로 변환합니다.
   * 3. 응답 DTO에는 새 파일 정보뿐 아니라 삭제된 파일 ID 목록도 포함됩니다.
   *
   * 주의사항:
   * - 삭제된 파일 ID 목록은 `idsToDelete`로 주입받으며, 비동기 Promise입니다.
   * - 파일 타입은 MIME 타입에 따라 이미지/비디오/문서로 분기됩니다.
   *
   * @param files 업로드된 Multer 파일 배열
   * @param inquiry 수정 대상 문의 게시글 엔티티
   * @param idsToDelete 삭제된 파일 ID 목록을 포함한 Promise 객체
   * @returns 파일 저장 결과를 담은 응답 DTO 배열
   */
  private async createNewApplicationFile(
    files: Express.Multer.File[],
    inquiry: Inquiry,
    idsToDelete: Promise<number[] | undefined>
  ): Promise<InquiryFileUpdateResponseDto[]> {
    return (
      await this.applicationFileRepository.saveAll(
        files.map((file) => {
          const applicationFile = new ApplicationFile();
          applicationFile.relatedId = inquiry.id;
          applicationFile.originalName = file.originalname;
          applicationFile.path = file.path;
          applicationFile.fileType = file.mimetype.startsWith('image/')
            ? 'image'
            : file.mimetype.startsWith('video/')
              ? 'video'
              : 'document';
          applicationFile.mimeType = file.mimetype;
          applicationFile.size = file.size;

          return applicationFile;
        })
      )
    ).map((file) => {
      return new InquiryFileUpdateResponseDto({
        id: file.id,
        path: file.path,
        originalName: file.originalName,
        deleteFileIds: idsToDelete,
      });
    });
  }

  /**
   * 특정 문의 게시글에 첨부된 파일들을 삭제합니다.
   *
   * 주요 기능:
   * - 파일 ID 목록을 기반으로 파일 엔티티들을 조회합니다.
   * - 각 파일을 삭제하며 삭제된 파일 ID를 수집합니다.
   *
   * 예외 처리:
   * - 파일 삭제 중 실패한 경우 예외를 발생시킵니다.
   *
   * @param inquiry 삭제 대상 게시글 엔티티
   * @returns 삭제된 파일 ID 목록
   * @throws HttpExceptionResponse 파일 삭제 중 문제가 발생한 경우
   */
  private async deleteInquiryFiles(inquiry: Inquiry): Promise<number[]> {
    const deleteTargetApplicationFiles: ApplicationFile[] =
      await this.applicationFileRepository.findByRelatedId(inquiry.id);

    if (!deleteTargetApplicationFiles.length) {
      logger.info(
        `${inquiry.id} 번 문의 게시글의 포함된 파일이 존재 하지 않아 삭제 작업 없음.`
      );

      return [];
    }

    const deleteInquiryFileIds: number[] = [];

    for (const inquiryFile of deleteTargetApplicationFiles) {
      if (!(await fileCleanerAsync(inquiryFile.path))) {
        return Promise.reject(
          new HttpExceptionResponse(
            500,
            `문의 게시글의 첨부 파일 고유 번호 ${inquiryFile.id} 의 ${inquiryFile.path} 삭제 실패`
          )
        );
      }

      const deletedInquiryFileId: number | null =
        await this.applicationFileRepository.deleteById(inquiryFile.id);

      if (!deletedInquiryFileId) {
        return Promise.reject(
          new HttpExceptionResponse(
            500,
            `문의 게시글의 첨부 파일 고유 번호 ${inquiryFile.id} 삭제 실패`
          )
        );
      }

      deleteInquiryFileIds.push(deletedInquiryFileId);
    }

    return deleteInquiryFileIds;
  }

  /**
   * 비회원 닉네임의 중복 여부를 확인하고 중복 시 새로운 닉네임을 생성하여 중복되지 않을 때까지 반복합니다.
   *
   * @param {string | undefined} guestNickName - 중복 확인할 비회원 닉네임
   * @param {InquiryRepository} inquiryRepository - 문의글 저장소 객체 (Repository)
   * @returns {Promise<boolean>} 중복되지 않는 닉네임 생성 성공 시 true 반환
   *
   * @throws {Error} 매개 변수 누락 또는 유효하지 않을 경우
   * @throws {HttpExceptionResponse} 1000회 반복에도 중복되지 않는 닉네임을 생성하지 못한 경우
   *
   * @description
   * - 전달받은 닉네임이 기존 문의글에서 사용 중인지 검사합니다.
   * - 중복일 경우 닉네임을 새로 생성한 뒤 다시 중복 여부를 확인합니다.
   * - 중복 확인은 최대 1000번 시도하며, 초과 시 예외를 발생시킵니다.
   *
   * @example
   * const isUnique = await this.checkDuplicateGuestNickNameUuid('익명1234', this.inquiryRepository);
   * if (isUnique) {
   *   // 닉네임 사용 가능
   * }
   */
  private async checkDuplicateGuestNickNameUuid(
    guestNickName: string | undefined,
    inquiryRepository: InquiryRepository
  ): Promise<boolean> {
    logger.info(`[createInquiry - checkDuplicateGuestNickNameUuid] 동작 시작`);

    guestNickName ??= generatedGuestNickNameUuid();

    if (!inquiryRepository) {
      throw new Error(
        `[createInquiry - checkDuplicateGuestNickNameUuid] 매개 변수값 확인 필요`
      );
    }

    let loopCount: number = 0;

    const triedNicknames = new Set<string>();

    while (loopCount < 1000) {
      logger.info(
        `[createInquiry - checkDuplicateGuestNickNameUuid] ${loopCount} 번째 검증 시작`
      );

      if (triedNicknames.has(guestNickName)) {
        guestNickName = generatedGuestNickNameUuid();

        logger.info(
          `[createInquiry - checkDuplicateGuestNickNameUuid] guestNickName: ${guestNickName}`
        );

        continue;
      }

      triedNicknames.add(guestNickName);

      const inquiry: Inquiry | null =
        await inquiryRepository.findByGuestNickName(guestNickName);

      if (!inquiry) {
        return true;
      }

      logger.info(
        `[createInquiry - checkDuplicateGuestNickNameUuid] writer: ${inquiry.guestNickName}`
      );

      loopCount++;
    }

    logger.error(`문의 게시글 등록 중 비회원 닉네임 생성 실패`);
    throw new HttpExceptionResponse(500, `문의 게시글 등록 실패`);
  }

  /**
   * 문의 게시글 접근에 대한 인가를 검사합니다.
   *
   * @param {Request} request - 사용자 요청 객체
   * @param {JobType} jobType - 수행하려는 작업 유형 (조회, 수정, 삭제 등)
   * @returns {Promise<boolean | undefined>} 인가 성공 여부
   *
   * @throws {HttpExceptionResponse}
   * - 404: 존재하지 않는 게시글
   * - 401: 인가 실패 (비회원 비밀번호 불일치, 본인 작성글 아님, 관리자 권한 초과 등)
   *
   * @description
   * - 비회원인 경우: 쿠키의 비밀번호를 복호화하여 DB에 저장된 비밀번호와 비교합니다.
   * - 회원인 경우:
   *   - 일반 회원은 본인이 작성한 글만 접근 가능합니다.
   *   - 관리자는 조회는 가능하지만, **수정/삭제는 본인이 작성한 글만 가능**합니다.
   * - 최종적으로 검증이 완료되면 true 반환, 실패 시 예외 발생.
   *
   * @example
   * const isAuthorized = await checkAuthorization(req, JobType.UPDATE);
   * if (!isAuthorized) throw new ForbiddenException();
   */
  async checkAuthorization(
    request: Request,
    jobType: JobType
  ): Promise<boolean | undefined> {
    try {
      logger.info(`[InquiryService - checkAuthorization] 인가 검증 시작`);

      const inquiry: Inquiry | null = await this.getInquiry(
        Number(request.params.inquiryId)
      );

      const requestUser: User | null = await this.getRequestUser(request);

      if (!requestUser) {
        await this.verificationOfNonUser(request, inquiry);
      }

      logger.info(`[InquiryService - checkAuthorization] 회원 인가 검증 시작`);

      const {
        requestUserUserWriteInquiryAccessStatus,
        requestUserGuestWriteInquiryAccessStatus,
      } = this.analyzeWriter(inquiry);

      if (requestUserUserWriteInquiryAccessStatus) {
        logger.info(
          `[InquiryService - checkAuthorization] 작성자가 회원인 게시글 접근`
        );

        if (requestUser!.userType !== UserRole.ADMINISTRATOR) {
          return this.userInquiryAccessValidator(requestUser!, inquiry);
        }

        return this.administratorInquiryAccessStatusValidator(
          requestUser!,
          inquiry,
          jobType
        );
      }

      if (requestUserGuestWriteInquiryAccessStatus) {
        this.requestUserAccessNonUserWriteValidator(
          requestUser!,
          inquiry,
          jobType
        );
      }

      return Promise.reject(
        new Error(
          `[checkAuthorization] 작성자 정보가 없음 (회원/비회원 모두 NULL)`
        )
      );
    } catch (error: any) {
      logger.error(
        `[InquiryService - checkAuthorization] 권한 검사 중 예외 발생: ${error.message}`
      );

      throw error;
    }
  }

  /**
   * 비회원 문의 게시글의 비밀번호를 검증합니다.
   *
   * @param {Promise<string>} guestPasswordCookie - 암호화된 비회원 비밀번호 쿠키 (복호화 대상)
   * @param {Inquiry} inquiry - 검증 대상 문의 게시글 엔티티
   * @returns {Promise<boolean>} 검증 성공 시 true 반환, 실패 시 예외 발생
   *
   * @throws {HttpExceptionResponse} 비밀번호가 일치하지 않을 경우 400 예외를 발생시킴
   *
   * @description
   * - 암호화된 비회원 비밀번호를 복호화한 뒤, 게시글에 저장된 해시된 비밀번호와 비교합니다.
   * - 내부적으로 `decryptGuestPassword` → `checkPassword`(bcrypt 비교) 과정을 수행합니다.
   * - 비밀번호가 일치하지 않으면 예외를 던지고, 일치하면 true 반환 후 종료합니다.
   *
   * @example
   * await this.validateGuestPassword(cookieValue, inquiry);
   */
  private async validateGuestPassword(
    guestPasswordCookie: Promise<string>,
    inquiry: Inquiry
  ): Promise<boolean> {
    logger.info(
      `[InquiryService - validateGuestPassword] 비회원 비밀번호 검증 시작`
    );

    if (
      !(await checkPassword(
        decryptGuestPassword(await guestPasswordCookie),
        inquiry.guestPassword!
      ))
    ) {
      logger.info(
        `[InquiryService - validateGuestPassword] 비회원 비밀번호 검증 완료`
      );

      throw new HttpExceptionResponse(400, `비회원 암호 확인 필요`);
    }

    logger.info(
      `[InquiryService - validateGuestPassword] 비회원 비밀번호 검증 완료`
    );

    return true;
  }

  private async getInquiry(inquiryId: number): Promise<Inquiry> {
    const inquiry: Inquiry | null =
      await this.inquiryRepository.findInquiryWithUserByInquiryId(
        Number(inquiryId)
      );

    if (!inquiry) {
      return Promise.reject(
        new HttpExceptionResponse(404, `존재하지 않는 문의 게시글`)
      );
    }

    return inquiry;
  }

  private async getRequestUser(request: Request): Promise<User | null> {
    return request.user
      ? ({
          id: request.user.id,
          email: request.user.email,
          nickName: '', // 필요한 경우 데이터베이스에서 조회
          password: '',
          userType: request.user.role,
          loginAttemptCount: 0,
          blockState: false,
          withdrawnDateTime: null,
        } as User)
      : null;
  }

  private async verificationOfNonUser(request: Request, inquiry: Inquiry) {
    logger.info(`[InquiryService - checkAuthorization] 비회원 인가 검증 시작`);

    const guestPasswordCookie: Promise<string> = validateGuestPasswordCookie(
      request,
      inquiry.id
    );

    if (await this.validateGuestPassword(guestPasswordCookie, inquiry)) {
      logger.info(
        `[InquiryService - checkAuthorization] 비회원 인가 검증 완료`
      );
      return true;
    }

    return Promise.reject(
      new HttpExceptionResponse(401, '비회원 비밀번호가 일치하지 않습니다.')
    );
  }

  private analyzeWriter(inquiry: Inquiry): {
    requestUserUserWriteInquiryAccessStatus: boolean;
    requestUserGuestWriteInquiryAccessStatus: boolean;
  } {
    logger.info(
      `[InquiryService - analyzeWriter] 문의 관련 글 작성자 권한 분석 시작`
    );

    const requestUserUserWriteInquiryAccessStatus: boolean =
      inquiry.user?.id != null;
    const requestUserGuestWriteInquiryAccessStatus: boolean =
      inquiry.guestNickName != null;

    logger.info(
      `[InquiryService - analyzeWriter] 문의 관련 글 작성자 권한 분석 완료`
    );

    return {
      requestUserUserWriteInquiryAccessStatus:
        requestUserUserWriteInquiryAccessStatus,
      requestUserGuestWriteInquiryAccessStatus:
        requestUserGuestWriteInquiryAccessStatus,
    };
  }

  private userInquiryAccessValidator(
    requestUser: User,
    inquiry: Inquiry
  ): boolean {
    logger.info(
      `[InquiryService - userInquiryAccessValidator] 일반 회원 인가 검증 시작`
    );

    if (requestUser.id !== inquiry.user!.id) {
      logger.error(
        `회원 자신의 글이 아닌 글에 접근 시도 - user: ${JSON.stringify(inquiry.user)}, nickName: ${requestUser.nickName}`
      );
      throw new HttpExceptionResponse(401, '자신이 작성한 글만 접근 가능');
    }

    logger.info(
      `[InquiryService - userInquiryAccessValidator] 일반 회원 인가 검증 완료`
    );

    return true;
  }

  private administratorInquiryAccessStatusValidator(
    requestUser: User,
    inquiry: Inquiry,
    jobType: JobType
  ) {
    logger.info(
      `[InquiryService - administratorInquiryAccessStatusValidator] 관리자 인가 검증 완료`
    );

    if (requestUser.id === inquiry.user!.id) {
      logger.info(
        `[InquiryService - administratorInquiryAccessStatusValidator] 관리자 자신의 글 인가 검증 완료`
      );
      return true;
    }

    if (jobType === JobType.CREATE || jobType === JobType.READ) {
      logger.info(
        `[InquiryService - administratorInquiryAccessStatusValidator] 관리자 타인 글 조회 및 댓글, 답글 작성, 수정, 삭제 허용`
      );
      return true;
    }

    logger.warn(
      `[InquiryService - administratorInquiryAccessStatusValidator] 관리자 타인 글 수정/삭제 시도`
    );
    return Promise.reject(
      new HttpExceptionResponse(
        401,
        '관리자여도 본인이 작성한 글 외에 수정, 삭제 불가'
      )
    );
  }

  private requestUserAccessNonUserWriteValidator(
    requestUser: User,
    inquiry: Inquiry,
    jobType: JobType
  ) {
    logger.info(
      `[InquiryService - requestUserAccessNonUserWriteValidator] 작성자가 비회원인 게시글 접근 권한 분석 시작`
    );

    if (
      requestUser.userType === UserRole.ADMINISTRATOR &&
      jobType === JobType.READ
    ) {
      logger.info(
        `[InquiryService - requestUserAccessNonUserWriteValidator] 관리자 비회원 글 조회 허용`
      );
      return true;
    }

    logger.error(
      `[InquiryService - requestUserAccessNonUserWriteValidator] 회원 또는 관리자 비회원 글 접근 차단`
    );
    return Promise.reject(
      new HttpExceptionResponse(401, '비회원 글에는 접근할 수 없습니다.')
    );
  }
}
