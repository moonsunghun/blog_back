import { Request, Response, Router } from 'express';
import { InquiryService } from '../../../core/api/services/inquiry/InquiryService';
import { validateRequest } from '../../../core/middlewares/ZodValidator';
import { inquiryAnswerStatus, inquiryIdSchema } from '../../../core/schemas/zod/InquirySchemas';
import { DefaultResponse } from '../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../core/processor/CommonExceptionControllerResponseProcessor';
import { AdminInquiryAnswerStatusUpdateDto } from '../../../core/models/dtos/request/inquiry/AdminInquiryAnswerStatusUpdateDto';
import { authenticationCheckForAdministrator } from '../../../core/middlewares/AuthenticationMiddleware';

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
    this.router.put(
      '/inquiries/:inquiryId/answer',
      authenticationCheckForAdministrator,
      validateRequest({
        params: inquiryIdSchema,
        body: inquiryAnswerStatus,
      }),

      this.adminInquiryAnswerStatusUpdate.bind(this)
    );
  }

  /**
   * @swagger
   * /api/inquiries/{inquiryId}/answer:
   *   put:
   *     summary: 관리자 - 문의글 답변 상태 수정
   *     description: 세션 기반 로그인 이후, 관리자만 접근 가능한 API 입니다. 로그인 시 발급된 세션 쿠키를 포함하여 요청해야 합니다.
   *     tags:
   *       - Inquiries
   *     security:
   *       - sessionCookie: []
   *     parameters:
   *       - name: inquiryId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: "답변 상태를 수정할 문의글 ID"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AdminInquiryAnswerStatusUpdateDto'
   *     responses:
   *       200:
   *         description: "답변 상태 수정 성공"
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "답변 상태 수정 성공"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       description: "문의 ID"
   *                       example: 42
   *       401:
   *         description: "인증되지 않은 사용자 (세션 없음 또는 만료)"
   *       403:
   *         description: "권한 없음 (관리자 아님)"
   *       404:
   *         description: "해당 문의글을 찾을 수 없음"
   *       500:
   *         description: "서버 내부 오류"
   */
  private async adminInquiryAnswerStatusUpdate(request: Request, response: Response) {
    try {
      const adminInquiryAnswerStatusUpdateDto = new AdminInquiryAnswerStatusUpdateDto({
        inquiryId: Number(request.params.inquiryId),
        answerStatus: request.body.answerStatus,
      });

      const result: DefaultResponse<{
        id: number;
      }> = await this.inquiryService.adminInquiryAnswerStatusUpdate(
        adminInquiryAnswerStatusUpdateDto
      );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `관리자 문의 게시글 답변 상태 수정 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
