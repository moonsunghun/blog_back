import { Request, Response, Router } from 'express';
import { AuthenticateService } from '../../../../core/api/services/authentication/AuthenticateService';
import {
  authenticationSchema,
  detailRegisterUserSchema,
} from '../../../../core/schemas/zod/AuthenticationSchemas';
import { validateRequest } from '../../../../core/middlewares/ZodValidator';
import { DefaultResponse } from '../../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../../core/processor/CommonExceptionControllerResponseProcessor';
import { getUserRole } from '../../../../core/middlewares/AuthenticationMiddleware';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: 인증/회원가입 관련 API
 */
export class AuthenticateController {
  public readonly router: Router;
  private readonly authenticateService: AuthenticateService;

  constructor() {
    this.router = Router();
    this.authenticateService = new AuthenticateService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/signup',
      validateRequest({ body: detailRegisterUserSchema }),
      this.register.bind(this)
    );

    this.router.post(
      '/login',
      validateRequest({
        body: authenticationSchema,
      }),
      this.login.bind(this)
    );

    this.router.post('/logout', this.logout.bind(this));

    /**
     * @swagger
     * /api/authentication/roles:
     *   get:
     *     summary: 사용자 역할 조회
     *     description: |
     *       현재 로그인한 사용자의 역할(Role)을 반환합니다.
     *       <br/>세션 기반으로 인증되며, 로그인하지 않은 경우 GUEST로 간주됩니다.
     *     tags:
     *       - Authentication
     *     security:
     *       - sessionCookie: []  # 세션 쿠키 인증
     *     responses:
     *       200:
     *         description: 사용자 역할 반환 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               enum: [GUEST, USER, ADMINISTRATOR]
     *               example: USER
     *       500:
     *         description: 서버 내부 오류
     */
    this.router.get('/roles', getUserRole);
  }

  /**
   * @swagger
   * /api/authentication/signup:
   *   post:
   *     summary: 회원가입
   *     tags:
   *       - Authentication
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 description: 이메일
   *               password:
   *                 type: string
   *                 description: 비밀번호
   *               nickName:
   *                 type: string
   *                 description: 별명
   *           example:
   *             email: "test@example.com"
   *             password: "password123!!"
   *             nickName: "테스트"
   *     responses:
   *       201:
   *         description: 회원가입 성공
   *       409:
   *         description: 이미 존재하는 이메일
   *       400:
   *         description: 필수값 누락
   *       500:
   *         description: 서버 오류
   */
  private async register(request: Request, response: Response): Promise<Response> {
    const { email, password, nickName } = request.body;

    try {
      const result = await this.authenticateService.registerUser(email, password, nickName);
      return response.status(result?.statusCode ?? 201).json(result);
    } catch (error: any) {
      let errorMessage = '회원가입 중 오류 발생';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return response.status(500).json({ message: '회원가입 중 오류 발생', error: errorMessage });
    }
  }

  /**
   * @swagger
   * /api/authentication/login:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: 회원 로그인
   *     description: 이메일과 비밀번호를 통해 로그인하고 세션을 발급받습니다.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: test@example.com
   *                 description: 사용자 이메일
   *               password:
   *                 type: string
   *                 format: password
   *                 example: 'password123!!'
   *                 description: 사용자 비밀번호
   *               rememberMeStatus:
   *                 type: string
   *                 example: 'true'
   *                 description: 세션 유지 여부 (true 시 장기 세션 유지)
   *     responses:
   *       200:
   *         description: 로그인 성공 및 세션 발급
   *         headers:
   *           Set-Cookie:
   *             description: 세션 쿠키 (`connect.sid`)가 발급됩니다.
   *             schema:
   *               type: string
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
   *                   example: 로그인 성공
   *       401:
   *         description: 인증 실패 (잘못된 이메일 혹은 비밀번호)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  private async login(request: Request, response: Response) {
    const { email, password, rememberMeStatus } = request.body;

    try {
      const result: DefaultResponse<void> = await this.authenticateService.login(
        request,
        email,
        password,
        rememberMeStatus
      );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `로그인 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/authentication/logout:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: 회원 로그아웃
   *     description: 현재 로그인된 사용자의 세션을 제거하고 로그아웃합니다.
   *     security:
   *       - sessionCookie: []
   *     responses:
   *       200:
   *         description: 로그아웃 성공
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
   *                   example: 로그아웃 성공
   *       500:
   *         description: 로그아웃 처리 중 서버 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  private async logout(request: Request, response: Response) {
    try {
      const result: DefaultResponse<void> = await this.authenticateService.logout(
        request,
        response
      );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `로그아웃 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
