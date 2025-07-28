import { Request, Response, Router } from 'express';
import { AuthenticateService } from '../../../../core/api/services/authentication/AuthenticateService';
import {
  authenticationSchema,
  detailRegisterUserSchema,
} from '../../../../core/schemas/zod/AuthenticationSchemas';
import { validateRequest } from '../../../../core/middlewares/ZodValidator';
import { DefaultResponse } from '../../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../../core/processor/CommonExceptionControllerResponseProcessor';
import { getCurrentUserRole } from '../../../../core/middlewares/JwtAuthenticationMiddleware';

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
     *       <br/>JWT 토큰 기반으로 인증되며, 로그인하지 않은 경우 GUEST로 간주됩니다.
     *     tags:
     *       - Authentication
     *     security:
     *       - bearerAuth: []  # JWT 토큰 인증
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
    this.router.get('/roles', getCurrentUserRole);
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
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 201
   *                 message:
   *                   type: string
   *                   example: 회원가입 성공
   *                 data:
   *                   type: object
   *                   properties:
   *                     userId:
   *                       type: integer
   *                       example: 1
   *       409:
   *         description: 중복된 이메일 또는 닉네임
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  private async register(
    request: Request,
    response: Response
  ): Promise<Response> {
    const { email, password, nickName } = request.body;

    try {
      const result = await this.authenticateService.registerUser(
        email,
        password,
        nickName
      );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(error, `회원가입 실패`);

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/authentication/login:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: 회원 로그인
   *     description: 이메일과 비밀번호를 통해 로그인하고 JWT 토큰을 발급받습니다.
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
   *                 description: 토큰 유지 여부 (true 시 장기 토큰 유지)
   *     responses:
   *       200:
   *         description: 로그인 성공 및 JWT 토큰 발급
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
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: string
   *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *                       description: JWT 토큰
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
      const result: DefaultResponse<{ token: string }> =
        await this.authenticateService.login(email, password, rememberMeStatus);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(error, `로그인 실패`);

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/authentication/logout:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: 로그아웃
   *     description: 로그아웃을 처리합니다. 클라이언트에서 JWT 토큰을 삭제해야 합니다.
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
   *         description: 서버 내부 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  private async logout(request: Request, response: Response) {
    try {
      const result: DefaultResponse<void> =
        await this.authenticateService.logout();

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(error, `로그아웃 실패`);

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
