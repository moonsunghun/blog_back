import { Request, Response, Router } from 'express';
import { DefaultResponse } from '../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../core/processor/CommonExceptionControllerResponseProcessor';
import { InquiryService } from '../../../core/api/services/inquiry/InquiryService';
import { InquiryCreateRequestDto } from '../../../core/models/dtos/request/inquiry/InquiryCreateRequestDto';
import { InquiryCreateResponseDto } from '../../../core/models/dtos/response/inquiry/InquiryCreateResponseDto';
import { validateRequest } from '../../../core/middlewares/ZodValidator';
import {
  inquiryCreateSchema,
  inquiryIdSchema,
  inquiryUpdateSchema,
} from '../../../core/schemas/zod/InquirySchemas';
import { InquiryUpdateRequestDto } from '../../../core/models/dtos/request/inquiry/InquiryUpdateRequestDto';
import { InquiryUpdateResponseDto } from '../../../core/models/dtos/response/inquiry/InquiryUpdateResponseDto';
import { authenticationCheckForUserOfGuest } from '../../../core/middlewares/AuthenticationMiddleware';

/**
 * @swagger
 * tags:
 *   name: Inquiries
 *   description: 문의 관련 API
 */
export class InquiryController {
  public readonly router: Router;
  private readonly inquiryService: InquiryService;

  constructor() {
    this.router = Router();
    this.inquiryService = new InquiryService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/inquiries',
      authenticationCheckForUserOfGuest,
      validateRequest({
        body: inquiryCreateSchema,
      }),
      this.createInquiry.bind(this)
    );

    this.router.patch(
      '/inquiries/:inquiryId',
      authenticationCheckForUserOfGuest,
      validateRequest({
        params: inquiryIdSchema,
        body: inquiryUpdateSchema,
      }),
      this.updateInquiry.bind(this)
    );

    this.router.delete(
      '/inquiries/:inquiryId',
      authenticationCheckForUserOfGuest,
      validateRequest({
        params: inquiryIdSchema,
      }),
      this.deleteInquiry.bind(this)
    );
  }

  /**
   * @swagger
   * /api/inquiries:
   *   post:
   *     summary: 문의 게시글 작성
   *     description:
   *       회원 또는 비회원이 문의 게시글을 작성합니다.
   *       <br/>비회원의 경우 `guestPassword` 입력이 필요합니다.
   *       <br/>첨부파일은 multipart/form-data 형식으로 전달됩니다.
   *     tags:
   *       - Inquiries
   *     security:
   *       - bearerAuth: []  # 회원 인증 시 사용되는 JWT 토큰
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - contentFormat
   *               - category
   *               - title
   *               - content
   *             properties:
   *               guestPassword:
   *                 type: string
   *                 description: 비회원 비밀번호 (4자리)
   *                 example: "1234"
   *               contentFormat:
   *                 type: string
   *                 description: 본문 포맷 (HTML, Markdown 등)
   *                 example: "HTML"
   *               category:
   *                 type: string
   *                 description: 문의 카테고리
   *                 enum: [기술, 신고, 기타]
   *                 example: "기술"
   *               title:
   *                 type: string
   *                 description: 문의 제목
   *                 example: "서비스 이용 중 오류 발생"
   *               content:
   *                 type: string
   *                 description: 문의 본문 내용
   *                 example: "<p>로그인 시 오류가 발생합니다.</p>"
   *               files:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *                 description: 첨부파일들 (이미지, 문서 등)
   *     responses:
   *       201:
   *         description: 문의 게시글 작성 성공
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
   *                   example: "문의 게시글 등록 성공"
   *                 data:
   *                   $ref: '#/components/schemas/InquiryCreateResponseDto'
   *       400:
   *         description: 잘못된 요청
   *       500:
   *         description: 서버 내부 오류
   */
  private async createInquiry(request: Request, response: Response) {
    try {
      const inquiryCreatedRequestDto = new InquiryCreateRequestDto({
        userRequest: request,
        guestPassword: request.body.guestPassword,
        contentFormat: request.body.contentFormat,
        category: request.body.category,
        title: request.body.title,
        content: request.body.content,
      });

      const files = (request.files ?? []) as Express.Multer.File[];

      const result: DefaultResponse<InquiryCreateResponseDto> =
        await this.inquiryService.createInquiry(
          inquiryCreatedRequestDto,
          files
        );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(
          error,
          `문의 게시글 작성 실패`
        );

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/inquiries/{inquiryId}:
   *   patch:
   *     summary: 문의 게시글 수정
   *     description:
   *       회원 또는 비회원이 본인이 작성한 문의 게시글을 수정합니다.
   *       <br/>비회원의 경우 비밀번호 쿠키를 통해 인증해야 합니다.
   *     tags:
   *       - Inquiries
   *     security:
   *       - bearerAuth: []  # 회원 JWT 토큰
   *     parameters:
   *       - name: inquiryId
   *         in: path
   *         required: true
   *         description: 수정할 문의 게시글 ID
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - contentFormat
   *               - category
   *               - title
   *               - content
   *             properties:
   *               contentFormat:
   *                 type: string
   *                 description: 본문 포맷 (HTML, Markdown 등)
   *                 example: "HTML"
   *               category:
   *                 type: string
   *                 enum: [기술, 신고, 기타]
   *                 description: 문의 카테고리
   *                 example: "기술"
   *               title:
   *                 type: string
   *                 description: 수정할 제목
   *                 example: "서비스 오류가 있습니다."
   *               content:
   *                 type: string
   *                 description: 수정할 본문 내용
   *                 example: "<p>로그인 시 여전히 오류가 발생합니다.</p>"
   *               inquiryFileIds:
   *                 type: array
   *                 description: 삭제할 기존 파일 ID 목록
   *                 items:
   *                   type: integer
   *               files:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *                 description: 새로 추가할 첨부파일 목록
   *     responses:
   *       200:
   *         description: 수정 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/InquiryUpdateResponseDto'
   *       400:
   *         description: 잘못된 요청
   *       401:
   *         description: 인증 실패 (비회원 비밀번호 쿠키 없거나 불일치)
   *       404:
   *         description: 게시글 없음
   *       500:
   *         description: 서버 내부 오류
   */
  private async updateInquiry(request: Request, response: Response) {
    try {
      const inquiryUpdateRequestDto = new InquiryUpdateRequestDto({
        inquiryId: Number(request.params.inquiryId),
        contentFormat: request.body.contentFormat,
        category: request.body.category,
        title: request.body.title,
        content: request.body.content,
        deleteInquiryFileIds: request.body.inquiryFileIds,
      });

      const files = (request.files ?? []) as Express.Multer.File[];

      const result: DefaultResponse<InquiryUpdateResponseDto> =
        await this.inquiryService.updateInquiry(
          request,
          inquiryUpdateRequestDto,
          files
        );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(
          error,
          `문의 게시글 수정 실패`
        );

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/inquiries/{inquiryId}:
   *   delete:
   *     summary: 문의 게시글 삭제
   *     description:
   *       회원 또는 비회원이 본인이 작성한 문의 게시글을 삭제합니다.
   *       <br/>비회원의 경우 비밀번호 쿠키를 통해 인증해야 합니다.
   *     tags:
   *       - Inquiries
   *     security:
   *       - bearerAuth: []  # 회원 JWT 인증
   *     parameters:
   *       - name: inquiryId
   *         in: path
   *         required: true
   *         description: 삭제할 문의 게시글 ID
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 삭제 성공
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
   *                   example: "문의 게시글 삭제 성공"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       description: 삭제된 문의 게시글 ID
   *                       example: 1
   *                     deleteByInquiryFile:
   *                       type: object
   *                       description: 삭제된 파일 ID 목록
   *                       properties:
   *                         ids:
   *                           type: array
   *                           items:
   *                             type: integer
   *                           example: [3, 4, 5]
   *       401:
   *         description: 인증 실패 (비회원 쿠키 없거나 일치하지 않음)
   *       404:
   *         description: 해당 문의 게시글 없음
   *       500:
   *         description: 서버 내부 오류
   */
  private async deleteInquiry(request: Request, response: Response) {
    try {
      const result: DefaultResponse<{
        id: number;
        deleteByInquiryFile: { ids: number[] };
      }> = await this.inquiryService.deleteInquiry(
        request,
        Number(request.params.inquiryId)
      );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(
          error,
          '문의 게시글 삭제 실패'
        );

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
