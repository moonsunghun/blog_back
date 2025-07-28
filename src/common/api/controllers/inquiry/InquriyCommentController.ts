import { Request, Response, Router } from 'express';
import { DefaultResponse } from '../../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../../core/processor/CommonExceptionControllerResponseProcessor';
import { InquiryCommentService } from '../../../../core/api/services/inquiry/InquiryCommentService';
import { InquiryService } from '../../../../core/api/services/inquiry/InquiryService';
import { JobType, OrderBy } from '../../../../core/types/Enum';
import { InquiryCommentCreateRequestDto } from '../../../../core/models/dtos/request/inquiry/comment/InquiryCommentCreateRequestDto';
import { InquiryCommentListRequestDto } from '../../../../core/models/dtos/request/inquiry/comment/InquiryCommentListRequestDto';
import { InquiryCommentListResponseDto } from '../../../../core/models/dtos/response/inquiry/comment/InquiryCommentListResponseDto';
import { InquiryCommentUpdateRequestDto } from '../../../../core/models/dtos/request/inquiry/comment/InquiryCommentUpdateRequestDto';
import { InquiryCommentDeleteRequestDto } from '../../../../core/models/dtos/request/inquiry/comment/InquiryCommentDeleteRequestDto';
import { validateRequest } from '../../../../core/middlewares/ZodValidator';
import {
  inquiryCommentParamRequestSchema,
  inquiryCommentRegisterRequestSchema,
  inquiryCommentSchema,
  inquiryIdSchema,
} from '../../../../core/schemas/zod/InquirySchemas';
import { pageRequestSchema } from '../../../../core/schemas/zod/PageRequestSchma';
import { logger } from '../../../../core/utilities/Logger';
import { HttpExceptionResponse } from '../../../../core/api/exception/HttpExceptionResponse';

/**
 * @swagger
 * tags:
 *   name: Inquiry Comment (문의 댓글)
 *   description: 문의 관련 게시글 댓글 API
 */
export class InquiryCommentController {
  public readonly router: Router;
  private readonly inquiryService: InquiryService;
  private readonly inquiryCommentService: InquiryCommentService;

  constructor() {
    this.router = Router();
    this.inquiryService = new InquiryService();
    this.inquiryCommentService = new InquiryCommentService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/inquiries/:inquiryId/comments',
      validateRequest({
        params: inquiryIdSchema,
        body: inquiryCommentSchema,
      }),
      this.createdInquiryComment.bind(this)
    );

    this.router.get(
      '/inquiries/:inquiryId/comments',
      validateRequest({
        params: inquiryIdSchema,
        query: pageRequestSchema,
      }),
      this.inquiryCommentSearchListWithPaging.bind(this)
    );

    this.router.put(
      '/inquiries/:inquiryId/comments/:inquiryCommentId',
      validateRequest({
        params: inquiryCommentParamRequestSchema,
        body: inquiryCommentRegisterRequestSchema,
      }),
      this.inquiryCommentUpdate.bind(this)
    );

    this.router.delete(
      '/inquiries/:inquiryId/comments/:inquiryCommentId',
      validateRequest({
        params: inquiryCommentParamRequestSchema,
      }),
      this.deletedInquiryComment.bind(this)
    );
  }

  /**
   * @swagger
   * /inquiries/{inquiryId}/comments:
   *   post:
   *     summary: 문의 게시글에 대한 댓글 등록
   *     description: |
   *       회원 또는 비회원이 문의 게시글에 댓글을 작성합니다.
   *       회원은 JWT 토큰(`bearerAuth`)으로 인증되며,
   *       비회원은 비밀번호를 함께 전달해야 합니다.
   *     tags:
   *       - Inquiry Comment (문의 댓글)
   *     security:
   *       - bearerAuth: []  # JWT 인증 (회원 전용 기능용)
   *     parameters:
   *       - name: inquiryId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: 댓글을 작성할 문의 게시글의 ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InquiryCommentCreateDto'
   *     responses:
   *       200:
   *         description: 댓글 작성 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 statusCode:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "댓글 작성 성공"
   *                 data:
   *                   type: integer
   *                   description: 생성된 댓글 ID
   *                   example: 42
   *       400:
   *         description: 잘못된 요청
   *       401:
   *         description: 인증 실패 또는 비회원 비밀번호 누락
   *       500:
   *         description: 서버 내부 오류
   */
  private async createdInquiryComment(request: Request, response: Response) {
    try {
      if (
        !(await this.inquiryService.checkAuthorization(request, JobType.CREATE))
      ) {
        logger.error(`접근 권한 없는 접근 발생`);

        return Promise.reject(
          new HttpExceptionResponse(401, '본인이 작성한 글만 삭제 가능')
        );
      }

      const inquiryId: number = Number(request.params.inquiryId);

      const inquiryCommentRegisterDto = new InquiryCommentCreateRequestDto({
        userRequest: request,
        content: request.body.content,
      });

      const result: DefaultResponse<number> =
        await this.inquiryCommentService.createInquiryComment(
          inquiryId,
          inquiryCommentRegisterDto
        );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(
          error,
          '문의 게시글에 대한 댓글 작성 실패'
        );

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/inquiries/{inquiryId}/comments:
   *   get:
   *     summary: 특정 문의 게시글의 댓글 목록 조회
   *     description: |
   *       특정 문의 게시글에 작성된 댓글을 페이지네이션 및 정렬 방식으로 조회합니다.
   *     tags:
   *       - Inquiry Comment (문의 댓글)
   *     parameters:
   *       - name: inquiryId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: 조회할 문의 게시글 ID
   *       - name: pageNumber
   *         in: query
   *         required: false
   *         schema:
   *           type: integer
   *           default: 1
   *         description: 페이지 번호 (기본값 1)
   *       - name: perPageSize
   *         in: query
   *         required: false
   *         schema:
   *           type: integer
   *           default: 10
   *         description: 페이지당 댓글 수 (기본값 10)
   *       - name: orderBy
   *         in: query
   *         required: false
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *         description: 정렬 기준 (오름차순 asc 내림차순 desc)
   *     responses:
   *       200:
   *         description: 답글 목록 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/InquiryCommentListResponseDto'
   *       400:
   *         description: 잘못된 요청
   *       404:
   *         description: 해당 댓글을 찾을 수 없음
   *       500:
   *         description: 서버 내부 오류
   */
  private async inquiryCommentSearchListWithPaging(
    request: Request,
    response: Response
  ) {
    try {
      const inquiryCommentListRequestDto: InquiryCommentListRequestDto =
        new InquiryCommentListRequestDto({
          inquiryId: Number(request.params.inquiryId),
          pageNumber: Number(request.query.pageNumber) || 1,
          perPageSize: Number(request.query.perPagesize) || 10,
          orderBy: request.query.orderBy as OrderBy,
        });

      const result: DefaultResponse<InquiryCommentListResponseDto> =
        await this.inquiryCommentService.inquiryCommentSearchListWithPaging(
          inquiryCommentListRequestDto
        );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(
          error,
          `${request.params.inquiryId} 문의 게시글의 댓글 목록 조회 실패`
        );

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/inquiries/{inquiryId}/comments/{inquiryCommentId}:
   *   patch:
   *     summary: 문의 게시글 댓글 수정
   *     description: |
   *       회원 또는 비회원이 작성한 댓글을 수정합니다.
   *       <br/>회원은 세션 쿠키(`sessionCookie`)로 인증되며,
   *        비회원은 쿠키에 저장된 비밀번호로 인증합니다. (쿠키명: guestPassword-{commentId}`)로 인증합니다.
   *     tags:
   *       - Inquiry Comment (문의 댓글)
   *     security:
   *       - bearerAuth: []  # 회원 인증을 위한 JWT 토큰
   *     parameters:
   *       - name: inquiryId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: 수정 대상 댓글이 속한 문의 게시글 ID
   *       - name: inquiryCommentId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: 수정할 댓글 ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InquiryCommentUpdateRequestDto'
   *     responses:
   *       200:
   *         description: 댓글 수정 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 statusCode:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "댓글 수정 성공"
   *                 data:
   *                   type: integer
   *                   description: 수정된 댓글 ID
   *                   example: 10
   *       400:
   *         description: 잘못된 요청 또는 비회원 비밀번호 미검증
   *       401:
   *         description: 본인 외 접근 (세션 사용자 불일치 또는 쿠키 미확인)
   *       404:
   *         description: 댓글 또는 게시글이 존재하지 않음
   *       500:
   *         description: 서버 내부 오류
   */
  private async inquiryCommentUpdate(request: Request, response: Response) {
    try {
      if (
        !(await this.inquiryService.checkAuthorization(request, JobType.UPDATE))
      ) {
        logger.error(`접근 권한 없는 접근 발생`);

        return Promise.reject(
          new HttpExceptionResponse(401, '본인이 작성한 글만 삭제 가능')
        );
      }

      const inquiryCommentUpdateRequestDto = new InquiryCommentUpdateRequestDto(
        {
          inquiryId: Number(request.params.inquiryId),
          inquiryCommentId: Number(request.params.inquiryCommentId),
          content: request.body.content,
        }
      );

      const result: DefaultResponse<number> =
        await this.inquiryCommentService.inquiryCommentUpdate(
          request,
          inquiryCommentUpdateRequestDto
        );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(error, `댓글 수정 실패`);

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/inquiries/{inquiryId}/comments/{inquiryCommentId}:
   *   delete:
   *     summary: 문의 게시글 댓글 삭제
   *     description: |
   *       회원 또는 비회원이 자신이 작성한 댓글을 삭제합니다.
   *       <br/>비회원은 쿠키에 저장된 비밀번호를 통해 인증합니다. (쿠키명: guestPassword-{inquiryCommentId})
   *     tags:
   *       - Inquiry Comment (문의 댓글)
   *     security:
   *       - bearerAuth: []  # 회원인 경우 JWT 인증 필요
   *     parameters:
   *       - name: inquiryId
   *         in: path
   *         required: true
   *         description: 댓글이 속한 문의 게시글 ID
   *         schema:
   *           type: integer
   *       - name: inquiryCommentId
   *         in: path
   *         required: true
   *         description: 삭제할 댓글 ID
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 댓글 삭제 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 statusCode:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "댓글 삭제 성공"
   *                 data:
   *                   type: integer
   *                   description: 삭제된 댓글 ID
   *                   example: 42
   *       400:
   *         description: 잘못된 요청 형식 또는 비회원 비밀번호 쿠키 불일치
   *       401:
   *         description: 권한 없음 (본인만 삭제 가능)
   *       404:
   *         description: 댓글 또는 게시글을 찾을 수 없음
   *       500:
   *         description: 서버 내부 오류
   */
  private async deletedInquiryComment(request: Request, response: Response) {
    try {
      if (
        !(await this.inquiryService.checkAuthorization(request, JobType.DELETE))
      ) {
        logger.error(`접근 권한 없는 접근 발생`);

        return Promise.reject(
          new HttpExceptionResponse(401, '본인이 작성한 글만 삭제 가능')
        );
      }

      const inquiryCommentDeleteRequestDto = new InquiryCommentDeleteRequestDto(
        {
          inquiryId: Number(request.params.inquiryId),
          inquiryCommentId: Number(request.params.inquiryCommentId),
        }
      );

      const result: DefaultResponse<number> =
        await this.inquiryCommentService.deletedInquiryComment(
          request,
          inquiryCommentDeleteRequestDto
        );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(error, `댓글 삭제 실패`);

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
