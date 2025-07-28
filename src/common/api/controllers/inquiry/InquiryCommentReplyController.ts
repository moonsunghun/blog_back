import { Request, Response, Router } from 'express';
import { DefaultResponse } from '../../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../../core/processor/CommonExceptionControllerResponseProcessor';
import { InquiryCommentReplyService } from '../../../../core/api/services/inquiry/InquiryCommentReplyService';
import { JobType, OrderBy } from '../../../../core/types/Enum';
import { InquiryCommentReplyListResponseDto } from '../../../../core/models/dtos/response/inquiry/reply/InquiryCommentReplyListResponseDto';
import { InquiryCommentReplyCreateDto } from '../../../../core/models/dtos/request/inquiry/reply/InquiryCommentReplyCreateDto';
import { InquiryCommentReplyListRequestDto } from '../../../../core/models/dtos/request/inquiry/reply/InquiryCommentReplyListRequestDto';
import { InquiryCommentReplyUpdateDto } from '../../../../core/models/dtos/request/inquiry/reply/InquiryCommentReplyUpdateDto';
import { InquiryCommentReplyDeleteRequestDto } from '../../../../core/models/dtos/request/inquiry/reply/InquiryCommentReplyDeleteRequestDto';
import { validateRequest } from '../../../../core/middlewares/ZodValidator';
import {
  inquiryCommentIdSchema,
  inquiryCommentRegisterRequestSchema,
  inquiryCommentReplyParamRequestSchema,
  inquiryCommentSearchListRequestSchema,
} from '../../../../core/schemas/zod/InquirySchemas';
import { logger } from '../../../../core/utilities/Logger';
import { HttpExceptionResponse } from '../../../../core/api/exception/HttpExceptionResponse';
import { InquiryService } from '../../../../core/api/services/inquiry/InquiryService';

/**
 * @swagger
 * tags:
 *   name: Inquiries Comment Replies (문의 댓글 답글)
 *   description: 문의 관련 게시글 댓글의 답글 API
 */
export class InquiryCommentReplyController {
  public readonly router: Router;
  private readonly inquiryService: InquiryService;
  private readonly inquiryCommentReplyService: InquiryCommentReplyService;

  constructor() {
    this.router = Router();
    this.inquiryService = new InquiryService();
    this.inquiryCommentReplyService = new InquiryCommentReplyService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/inquiries/:inquiryId/comments/:inquiryCommentId/replies',
      validateRequest({
        params: inquiryCommentIdSchema,
        body: inquiryCommentRegisterRequestSchema,
      }),
      this.createInquiryCommentReply.bind(this)
    );

    this.router.get(
      '/inquiries/:inquiryId/comments/:inquiryCommentId/replies',
      validateRequest({
        params: inquiryCommentSearchListRequestSchema,
      }),
      this.inquiryCommentReplySearchListWithPaging.bind(this)
    );

    this.router.put(
      '/inquiries/:inquiryId/comments/:inquiryCommentId/replies/:inquiryCommentReplyId',
      validateRequest({
        params: inquiryCommentReplyParamRequestSchema,
        body: inquiryCommentRegisterRequestSchema,
      }),
      this.inquiryCommentReplyUpdate.bind(this)
    );

    this.router.delete(
      '/inquiries/:inquiryId/comments/:inquiryCommentId/replies/:inquiryCommentReplyId',
      validateRequest({
        params: inquiryCommentReplyParamRequestSchema,
      }),
      this.inquiryCommentReplyDelete.bind(this)
    );
  }

  /**
   * @swagger
   * /api/inquiries/{inquiryId}/comments/{inquiryCommentId}/replies:
   *   post:
   *     summary: 문의 게시글 댓글에 대한 답글 작성
   *     description: 회원 또는 비회원이 댓글에 대한 답글을 작성합니다. 비회원일 경우 비밀번호를 함께 전달할 수 있으며, 회원은 세션 쿠키를 통해 인증됩니다.
   *     tags:
   *       - Inquiries Comment Replies (문의 댓글 답글)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: inquiryCommentId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: 답글을 작성할 대상 댓글의 ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InquiryCommentReplyCreateDto'
   *     responses:
   *       201:
   *         description: 답글 작성 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 statusCode:
   *                   type: integer
   *                   example: 201
   *                 message:
   *                   type: string
   *                   example: "답글 작성 성공"
   *                 data:
   *                   type: integer
   *                   description: 생성된 답글 ID
   *                   example: 77
   *       400:
   *         description: 잘못된 요청
   *       403:
   *         description: 비회원 인증 실패
   *       500:
   *         description: 서버 내부 오류
   */
  private async createInquiryCommentReply(
    request: Request,
    response: Response
  ) {
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
      const inquiryCommentId: number = Number(request.params.inquiryCommentId);

      const inquiryCommentReplyCreateDto = new InquiryCommentReplyCreateDto({
        userRequest: request,
        content: request.body.content,
      });

      const result: DefaultResponse<number> =
        await this.inquiryCommentReplyService.createInquiryCommentReply(
          inquiryId,
          inquiryCommentId,
          inquiryCommentReplyCreateDto
        );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(
          error,
          '서버 내부 오류: 문의 게시글에 대한 댓글의 답글 작성 실패'
        );

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/inquiries/{inquiryId}/comments/{inquiryCommentId}/replies:
   *   get:
   *     summary: 특정 댓글의 답글 목록 조회 (페이징 포함)
   *     description: 회원 또는 비회원이 특정 댓글에 달린 답글 목록을 조회합니다. 회원은 세션 쿠키를 통해 인증됩니다.
   *     tags:
   *       - Inquiries Comment Replies (문의 댓글 답글)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: inquiryCommentId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: 답글을 조회할 댓글 ID
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
   *         description: 페이지당 항목 수 (기본값 10)
   *       - name: orderBy
   *         in: query
   *         required: false
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *         description: 정렬 순서 (asc 오름차순 desc 내림차순)
   *     responses:
   *       200:
   *         description: 답글 목록 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/InquiryCommentReplyListResponseDto'
   *       400:
   *         description: 잘못된 요청
   *       404:
   *         description: 해당 댓글을 찾을 수 없음
   *       500:
   *         description: 서버 내부 오류
   */
  private async inquiryCommentReplySearchListWithPaging(
    request: Request,
    response: Response
  ) {
    try {
      const inquiryCommentReplyListRequestDto: InquiryCommentReplyListRequestDto =
        new InquiryCommentReplyListRequestDto({
          inquiryCommentId: Number(request.params.inquiryCommentId),
          pageNumber: Number(request.query.pageNumber) || 1,
          perPageSize: Number(request.query.perPagesize) || 10,
          orderBy: request.query.orderBy as OrderBy,
        });

      const result: DefaultResponse<InquiryCommentReplyListResponseDto> =
        await this.inquiryCommentReplyService.inquiryCommentReplySearchListWithPaging(
          inquiryCommentReplyListRequestDto
        );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(
          error,
          `서버 내부 오류: ${request.params.inquiryCommentId} 문의 게시글의 댓글 답글 목록 조회 실패`
        );

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/inquiries/{inquiryId}/comments/{inquiryCommentId}/replies/{inquiryCommentReplyId}:
   *   patch:
   *     summary: 문의 게시글 답글 수정
   *     description: |
   *       회원 또는 비회원이 자신이 작성한 답글을 수정합니다.
   *       <br/>회원은 세션 쿠키로 인증되며,
   *       비회원은 쿠키에 저장된 비밀번호로 인증합니다. (쿠키명: guestPassword-{inquiryCommentReplyId})
   *     tags:
   *       - Inquiry Comment Reply (문의 답글)
   *     security:
   *       - bearerAuth: []  # 회원 JWT 인증용
   *     parameters:
   *       - name: inquiryId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: 해당 답글이 속한 문의 게시글 ID
   *       - name: inquiryCommentId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: 해당 답글이 속한 댓글 ID
   *       - name: inquiryCommentReplyId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: 수정할 답글 ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - content
   *             properties:
   *               content:
   *                 type: string
   *                 description: 수정할 답글 내용
   *                 example: "답글을 수정했습니다."
   *     responses:
   *       200:
   *         description: 답글 수정 성공
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
   *                   example: "답글 수정 성공"
   *                 data:
   *                   type: integer
   *                   description: 수정된 답글 ID
   *                   example: 15
   *       400:
   *         description: 요청 데이터가 유효하지 않음 또는 쿠키 없음
   *       401:
   *         description: 인증 실패 (회원 또는 비회원 본인 아님)
   *       404:
   *         description: 해당 답글 또는 댓글 없음
   *       500:
   *         description: 서버 내부 오류
   */
  private async inquiryCommentReplyUpdate(
    request: Request,
    response: Response
  ) {
    try {
      if (
        !(await this.inquiryService.checkAuthorization(request, JobType.UPDATE))
      ) {
        logger.error(`접근 권한 없는 접근 발생`);

        return Promise.reject(
          new HttpExceptionResponse(401, '본인이 작성한 글만 삭제 가능')
        );
      }

      const inquiryCommentReplyUpdateRequestDto =
        new InquiryCommentReplyUpdateDto({
          inquiryCommentId: Number(request.params.inquiryCommentId),
          inquiryCommentReplyId: Number(request.params.inquiryCommentReplyId),
          content: request.body.content,
        });

      const result: DefaultResponse<number> =
        await this.inquiryCommentReplyService.inquiryCommentReplyUpdate(
          request,
          inquiryCommentReplyUpdateRequestDto
        );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(
          error,
          `서버 내부 오류: 답글 수정 실패`
        );

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/inquiries/{inquiryId}/comments/{inquiryCommentId}/replies/{inquiryCommentReplyId}:
   *   delete:
   *     summary: 문의 게시글 답글 삭제
   *     description: |
   *       회원 또는 비회원이 자신이 작성한 답글을 삭제합니다.
   *       <br/>회원은 세션 쿠키로 인증되며,
   *       비회원은 쿠키에 저장된 비밀번호로 인증합니다. (쿠키명: guestPassword-{inquiryCommentReplyId})
   *     tags:
   *       - Inquiry Comment Reply (문의 답글)
   *     security:
   *       - bearerAuth: []  # JWT 기반 인증 (회원 전용)
   *     parameters:
   *       - name: inquiryId
   *         in: path
   *         required: true
   *         description: 해당 답글이 속한 문의 게시글 ID
   *         schema:
   *           type: integer
   *       - name: inquiryCommentId
   *         in: path
   *         required: true
   *         description: 해당 답글이 속한 댓글 ID
   *         schema:
   *           type: integer
   *       - name: inquiryCommentReplyId
   *         in: path
   *         required: true
   *         description: 삭제할 답글 ID
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 답글 삭제 성공
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
   *                   example: "답글 삭제 성공"
   *                 data:
   *                   type: integer
   *                   description: 삭제된 답글 ID
   *                   example: 10
   *       400:
   *         description: 요청 오류 또는 인증 쿠키 없음
   *       401:
   *         description: 인증 실패 (작성자 본인 아님)
   *       404:
   *         description: 해당 답글 또는 댓글 없음
   *       500:
   *         description: 서버 내부 오류
   */
  private async inquiryCommentReplyDelete(
    request: Request,
    response: Response
  ) {
    try {
      if (
        !(await this.inquiryService.checkAuthorization(request, JobType.DELETE))
      ) {
        logger.error(`접근 권한 없는 접근 발생`);

        return Promise.reject(
          new HttpExceptionResponse(401, '본인이 작성한 글만 삭제 가능')
        );
      }

      const inquiryCommentReplyDeleteRequestDto =
        new InquiryCommentReplyDeleteRequestDto({
          inquiryCommentId: Number(request.params.inquiryCommentId),
          inquiryCommentReplyId: Number(request.params.inquiryCommentReplyId),
        });

      const result: DefaultResponse<number> =
        await this.inquiryCommentReplyService.inquiryCommentReplyDelete(
          request,
          inquiryCommentReplyDeleteRequestDto
        );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(
          error,
          `서버 내부 오류: 답글 삭제 실패`
        );

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
