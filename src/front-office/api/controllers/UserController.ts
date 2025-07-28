import { Request, Response, Router } from 'express';
import { UserService } from '../../../core/api/services/user/UserService';
import { DefaultResponse } from '../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../core/processor/CommonExceptionControllerResponseProcessor';
import { validateRequest } from '../../../core/middlewares/ZodValidator';
import { userWithdrawSchema } from '../../../core/schemas/zod/UserSchemas';

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 사용자 관련 API
 */
export class UserController {
  public readonly router: Router;
  private readonly userService: UserService;

  constructor() {
    this.router = Router();
    this.userService = new UserService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.delete(
      '/withdraw',
      validateRequest({
        body: userWithdrawSchema,
      }),
      this.deleteUser.bind(this)
    );
  }

  /**
   * @swagger
   * /api/users/withdraw:
   *   delete:
   *     summary: 회원 탈퇴
   *     description: |
   *       회원 탈퇴를 처리합니다.
   *
   *       **⚠️ 탈퇴 전 확인사항:**
   *       - 정말 탈퇴하시겠습니까?
   *       - 탈퇴 후에도 작성하신 댓글은 삭제되지 않습니다.
   *       - 탈퇴 후 180일 동안 동일한 이메일로 재가입이 불가능합니다.
   *       - 탈퇴 후 180일 이내에는 탈퇴 취소가 가능합니다.
   *
   *       위 내용을 모두 확인하신 후 비밀번호를 입력하여 탈퇴를 진행해주세요.
   *     tags:
   *       - User
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserWithdrawRequestDto'
   *     responses:
   *       200:
   *         description: 회원 탈퇴 성공
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
   *                   example: "회원 탈퇴가 완료되었습니다. 작성하신 댓글은 보존되며, 180일 동안 동일한 이메일로 재가입이 제한됩니다."
   *                 data:
   *                   type: object
   *                   properties:
   *                     withdrawalPolicies:
   *                       type: object
   *                       properties:
   *                         commentsPreserved:
   *                           type: boolean
   *                           example: true
   *                           description: "댓글 보존 여부"
   *                         reRegistrationBlockedDays:
   *                           type: integer
   *                           example: 180
   *                           description: "재가입 제한 일수"
   *                         cancellationAvailableDays:
   *                           type: integer
   *                           example: 180
   *                           description: "탈퇴 취소 가능 일수"
   *                         withdrawnEmail:
   *                           type: string
   *                           example: "user@example.com"
   *                           description: "탈퇴한 이메일"
   *       400:
   *         description: 비밀번호 불일치
   *       401:
   *         description: 인증되지 않은 사용자
   *       500:
   *         description: 서버 오류
   */
  private async deleteUser(request: Request, response: Response) {
    if (!request.user) {
      return response
        .status(401)
        .json(DefaultResponse.response(401, '로그인이 필요합니다.'));
    }

    try {
      const result = await this.userService.deleteUser(request.user.id);
      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(error, '회원 탈퇴 실패');
      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
