import { Request, Response, Router } from 'express';
import { validateRequest } from '../../../core/middlewares/ZodValidator';
import { guestPasswordSchema, inquiryIdSchema } from '../../../core/schemas/zod/InquirySchemas';
import { DefaultResponse } from '../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../core/processor/CommonExceptionControllerResponseProcessor';
import { InquiryService } from '../../../core/api/services/inquiry/InquiryService';
import { encryptGuestPassword } from '../../../core/utilities/Encyprter';
import { logger } from '../../../core/utilities/Logger';
import { HttpExceptionResponse } from '../../../core/api/exception/HttpExceptionResponse';
import { guestPasswordSetCookie } from '../../../core/utilities/Cookie';

/**
 * @swagger
 * tags:
 *   name: Guest Authenticate
 *   description: 비회원 인증 관련 API
 */
export class GuestAuthenticateController {
  public readonly router: Router;
  private readonly inquiryService: InquiryService;

  constructor() {
    this.router = Router();
    this.inquiryService = new InquiryService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/authenticate/guests/inquiries/:inquiryId',
      validateRequest({
        params: inquiryIdSchema,
        body: guestPasswordSchema,
      }),
      this.checkInquiryGuestPassword.bind(this)
    );
  }

  /**
   * @swagger
   * /api/authenticate/guests/inquiries/{inquiryId}:
   *   post:
   *     summary: 비회원 문의 게시글 비밀번호 확인
   *     description:
   *       비회원이 작성한 문의 게시글의 비밀번호가 맞는지 확인합니다.
   *       <br/>비밀번호가 일치하면 암호화된 비밀번호를 쿠키(`guestPassword-{inquiryId}`)로 설정합니다.
   *     tags:
   *       - Inquiries (문의 게시글)
   *     parameters:
   *       - name: inquiryId
   *         in: path
   *         required: true
   *         description: 비밀번호를 확인할 문의 게시글 ID
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - guestPassword
   *             properties:
   *               guestPassword:
   *                 type: string
   *                 description: 비회원이 입력한 비밀번호
   *                 example: "1234"
   *     responses:
   *       200:
   *         description: 비밀번호 확인 성공 여부 반환 및 쿠키 설정
   *         headers:
   *           Set-Cookie:
   *             schema:
   *               type: string
   *             description: 비밀번호 일치 시 설정되는 쿠키 (`guestPassword-{inquiryId}`)
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
   *                   example: "비밀번호 확인 결과 반환"
   *                 data:
   *                   type: boolean
   *                   example: true
   *       400:
   *         description: 잘못된 요청 형식
   *       404:
   *         description: 해당 문의 게시글 없음
   *       500:
   *         description: 서버 내부 오류 또는 쿠키 생성 실패
   */
  private async checkInquiryGuestPassword(request: Request, response: Response) {
    try {
      const result: DefaultResponse<boolean> = await this.inquiryService.checkInquiryGuestPassword(
        Number(request.params.inquiryId),
        request.body.guestPassword
      );

      await this.createGuestPasswordCookie(request, response, result);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        '비회원 비밀번호 검증 실패'
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * 비회원 문의글 열람을 위한 비밀번호를 쿠키에 암호화하여 저장합니다.
   *
   * @param {Request} request - Express 요청 객체, `body.guestPassword`와 `params.inquiryId` 사용
   * @param {Response} response - Express 응답 객체, 쿠키 설정에 사용
   * @param {DefaultResponse<boolean>} result - 비회원 비밀번호 검증 결과 객체
   *
   * @returns {Promise<void>} 반환 값 없음. 쿠키 설정 성공 시 종료, 실패 시 예외 발생
   *
   * @throws {HttpExceptionResponse} 비밀번호나 문의글 ID가 유효하지 않거나 쿠키 설정 중 오류 발생 시 예외 반환
   *
   * @description
   * - 비회원이 본인의 문의글을 다시 열람할 수 있도록 하기 위해 암호를 쿠키에 암호화하여 저장합니다.
   * - 쿠키 이름은 `guestPassword-{inquiryId}` 형식으로 설정됩니다.
   * - 암호는 AES 방식으로 암호화되어 쿠키에 저장되며, 유효 기간은 1시간입니다.
   *
   * @example
   * await this.createGuestPasswordCookie(req, res, DefaultResponse.responseWithData(200, '성공', true));
   */
  private async createGuestPasswordCookie(
    request: Request,
    response: Response,
    result: DefaultResponse<boolean>
  ): Promise<void> {
    if (result.data !== true) return;

    const guestPassword: string | undefined = request.body.guestPassword;
    const inquiryId = Number(request.params.inquiryId);

    if (!guestPassword || isNaN(inquiryId)) {
      logger.warn(`[createGuestPasswordCookie] 잘못된 guestPassword 또는 inquiryId`);

      throw new HttpExceptionResponse(
        500,
        `비회원 암호 검증 뒤 암호화하여 쿠키 전달 로직 동작 중 문제 발생`
      );
    }

    const encryptedGuestPassword = encryptGuestPassword(guestPassword);

    guestPasswordSetCookie(response, `guestPassword-${inquiryId}`, encryptedGuestPassword, {
      encrypted: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    });
  }
}
