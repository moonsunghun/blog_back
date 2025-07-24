import { Request, Response, Router } from 'express';
import { UserService } from '../../../../core/api/services/user/UserService';
import { DefaultResponse } from '../../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../../core/processor/CommonExceptionControllerResponseProcessor';
import { UserPasswordUpdateRequestDto } from '../../../../core/models/dtos/request/user/UserPasswordUpdateRequestDto';
import { HttpExceptionResponse } from '../../../../core/api/exception/HttpExceptionResponse';
import { UserNickNameUpdateRequestDto } from '../../../../core/models/dtos/request/user/UserNicknameUpdateRequestDto';
import { findBySessionUserId } from '../../../../core/utilities/Finder';

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 사용자 관련 API
 */
export class UserMyPageController {
  public readonly router: Router;
  private readonly userService: UserService;

  constructor() {
    this.router = Router();
    this.userService = new UserService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/my-pages', this.getMyPage.bind(this));

    this.router.patch('/my-pages/nick-name', this.updateNickName.bind(this));

    this.router.patch('/my-pages/password', this.updatePassword.bind(this));
  }

  /**
   * @swagger
   * /api/users/my-pages:
   *   get:
   *     summary: 마이페이지 정보 조회
   *     tags:
   *       - User
   *     parameters:
   *       - name: userId
   *         in: query
   *         required: false
   *         schema:
   *           type: integer
   *         description: 사용자 ID (테스트용, 실제로는 세션에서 가져옴)
   *     responses:
   *       200:
   *         description: 이메일(아이디)와 별명 반환
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserProfileResponseDto'
   *       401:
   *         description: 인증되지 않은 사용자
   *       500:
   *         description: 서버 오류
   */
  private async getMyPage(request: Request, response: Response) {
    const user = await findBySessionUserId(request);
    if (!user) {
      return response.status(401).json(DefaultResponse.response(401, '로그인이 필요합니다.'));
    }

    try {
      const result = await this.userService.getUserMyPageInfo(user.id);
      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        '마이페이지 정보 조회 실패'
      );
      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/users/my-pages/nick-name:
   *   patch:
   *     summary: 별명 수정
   *     tags:
   *       - User
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserNickNameUpdateRequestDto'
   *     responses:
   *       200:
   *         description: 별명 수정 성공
   *       400:
   *         description: 유효성 검사 실패 또는 비속어 포함
   *       401:
   *         description: 인증되지 않은 사용자
   *       409:
   *         description: 이미 사용 중인 별명
   *       500:
   *         description: 서버 오류
   */
  private async updateNickName(request: Request, response: Response) {
    const user = await findBySessionUserId(request);

    if (!user) {
      return response.status(401).json(DefaultResponse.response(401, '로그인이 필요합니다.'));
    }

    try {
      const requestDto = new UserNickNameUpdateRequestDto(request.body);
      const result = await this.userService.updateNickName(user.id, requestDto);
      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        '별명 수정 실패'
      );
      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/users/my-pages/password:
   *   patch:
   *     summary: 비밀번호 수정
   *     tags:
   *       - User
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserPasswordUpdateRequestDto'
   *     responses:
   *       200:
   *         description: 비밀번호 수정 성공
   *       400:
   *         description: 유효성 검사 실패 또는 현재 비밀번호 불일치
   *       401:
   *         description: 인증되지 않은 사용자
   *       500:
   *         description: 서버 오류
   */
  private async updatePassword(request: Request, response: Response) {
    const user = await findBySessionUserId(request);

    if (!user) {
      return Promise.reject(new HttpExceptionResponse(401, `로그인이 필요합니다.`));
    }

    try {
      const requestDto = new UserPasswordUpdateRequestDto(request.body);

      // 새 비밀번호와 비밀번호 확인이 일치하는지 검증
      if (requestDto.newPassword !== requestDto.newPasswordConfirm) {
        return response
          .status(400)
          .json(DefaultResponse.response(400, '새 비밀번호와 비밀번호 확인이 일치하지 않습니다.'));
      }

      const result = await this.userService.updatePassword(user.id, requestDto);
      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        '비밀번호 수정 실패'
      );
      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
