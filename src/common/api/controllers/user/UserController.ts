import { Request, Response, Router } from 'express';
import { UserService } from '../../../../core/api/services/user/UserService';
import { UserNickNameUpdateRequestDto } from '../../../../core/models/dtos/request/user/UserNicknameUpdateRequestDto';
import { UserPasswordUpdateRequestDto } from '../../../../core/models/dtos/request/user/UserPasswordUpdateRequestDto';
import { DefaultResponse } from '../../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../../core/processor/CommonExceptionControllerResponseProcessor';
import { HttpExceptionResponse } from '../../../../core/api/exception/HttpExceptionResponse';

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 사용자 마이페이지 관련 API
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
   *     responses:
   *       200:
   *         description: 마이페이지 정보 조회 성공
   *       401:
   *         description: 인증되지 않은 사용자
   *       500:
   *         description: 서버 오류
   */
  private async getMyPage(request: Request, response: Response) {
    if (!request.user) {
      return response
        .status(401)
        .json(DefaultResponse.response(401, '로그인이 필요합니다.'));
    }

    try {
      const result = await this.userService.getUserMyPageInfo(request.user.id);
      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(
          error,
          '마이페이지 정보 조회 실패'
        );
      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
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
    if (!request.user) {
      return response
        .status(401)
        .json(DefaultResponse.response(401, '로그인이 필요합니다.'));
    }

    try {
      const requestDto = new UserNickNameUpdateRequestDto(request.body);
      const result = await this.userService.updateNickName(
        request.user.id,
        requestDto
      );
      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(error, '별명 수정 실패');
      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
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
    if (!request.user) {
      return Promise.reject(
        new HttpExceptionResponse(401, `로그인이 필요합니다.`)
      );
    }

    try {
      const requestDto = new UserPasswordUpdateRequestDto(request.body);
      const result = await this.userService.updatePassword(
        request.user.id,
        requestDto
      );
      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(error, '비밀번호 수정 실패');
      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
