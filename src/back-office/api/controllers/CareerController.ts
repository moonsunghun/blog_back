import { Request, Response, Router } from 'express';
import { validateRequest } from '../../../core/middlewares/ZodValidator';
import { DefaultResponse } from '../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../core/processor/CommonExceptionControllerResponseProcessor';
import { CareerService } from '../../../core/api/services/portfolio/CareerService';
import { CareerCreateRequestDto } from '../../../core/models/dtos/request/portfolio/career/CareerCreateRequestDto';
import { CareerCreateResponseDto } from '../../../core/models/dtos/response/portfolio/career/CareerCreateResponseDto';
import { CareerUpdateRequestDto } from '../../../core/models/dtos/request/portfolio/career/CareerUpdateRequestDto';
import { CareerUpdateResponseDto } from '../../../core/models/dtos/response/portfolio/career/CareerUpdateResponseDto';
import { CareerIdSchema, CareerSchema } from '../../../core/schemas/zod/CareerSchemas';
import { authenticationCheckForAdministrator } from '../../../core/middlewares/AuthenticationMiddleware';

export class CareerController {
  public readonly router: Router;
  private readonly careerService: CareerService;

  constructor() {
    this.router = Router();
    this.careerService = new CareerService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/portfolios/career',
      authenticationCheckForAdministrator,
      validateRequest({
        body: CareerSchema,
      }),
      this.createCareer.bind(this)
    );

    this.router.patch(
      '/portfolios/career/:careerId',
      authenticationCheckForAdministrator,
      validateRequest({
        params: CareerIdSchema,
        body: CareerSchema,
      }),
      this.updateCareer.bind(this)
    );

    this.router.delete(
      '/portfolios/career/:careerId',
      authenticationCheckForAdministrator,
      validateRequest({
        params: CareerIdSchema,
      }),
      this.deleteCareer.bind(this)
    );
  }

  /**
   * @swagger
   * /api/portfolios/career:
   *   post:
   *     summary: 포트폴리오 경력 작성
   *     description: 포트폴리오 경력을 작성합니다.
   *     tags:
   *       - Portfolios
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               companyName:
   *                 type: string
   *                 description: "회사명"
   *                 example: "카카오"
   *               position:
   *                 type: string
   *                 description: "직급"
   *                 example: "프론트엔드 개발자"
   *               startDate:
   *                 type: string
   *                 description: "입사일"
   *                 example: "2020-10-01"
   *               endDate:
   *                 type: string
   *                 description: "퇴사일"
   *                 example: "2022-12-25"
   *     responses:
   *       200:
   *         description: "포트폴리오 경력 생성 성공"
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
   *                   example: "포트폴리오 경력 생성 성공"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       description: "포트폴리오 경력 ID"
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
  private async createCareer(request: Request, response: Response) {
    try {
      const careerCreatedRequestDto = new CareerCreateRequestDto({
        companyName: request.body.companyName,
        position: request.body.position,
        startDate: request.body.startDate,
        endDate: request.body.endDate,
      });

      const result: DefaultResponse<CareerCreateResponseDto> =
        await this.careerService.createCareer(careerCreatedRequestDto);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `포트폴리오 경력 생성 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/portfolios/career/{careerId}:
   *   patch:
   *     summary: 포트폴리오 경력 수정
   *     tags:
   *       - Portfolios
   *     parameters:
   *       - in: path
   *         name: careerId
   *         required: true
   *         schema:
   *           type: integer
   *         description: 수정할 포트폴리오 경력 ID
   *     consumes:
   *       - application/json
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               companyName:
   *                 type: string
   *                 description: "회사명"
   *                 example: "네이버"
   *               position:
   *                 type: string
   *                 description: "직급"
   *                 example: "백엔드 개발자"
   *               startDate:
   *                 type: string
   *                 description: "입사일"
   *                 example: "2023-01-01"
   *               endDate:
   *                 type: string
   *                 description: "퇴사일"
   *                 example: "2025-03-12"
   *     responses:
   *       200:
   *         description: 포트폴리오 경력 수정 성공
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
   *                   example: 포트폴리오 경력 수정 성공
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *       401:
   *         description: "인증되지 않은 사용자 (세션 없음 또는 만료)"
   *       403:
   *         description: "권한 없음 (관리자 아님)"
   *       404:
   *         description: "해당 문의글을 찾을 수 없음"
   *       500:
   *         description: "서버 내부 오류"
   */
  private async updateCareer(request: Request, response: Response) {
    try {
      const careerUpdateRequestDto = new CareerUpdateRequestDto({
        careerId: Number(request.params.careerId),
        companyName: request.body.companyName,
        position: request.body.position,
        startDate: request.body.startDate,
        endDate: request.body.endDate,
      });

      const result: DefaultResponse<CareerUpdateResponseDto> =
        await this.careerService.updateCareer(careerUpdateRequestDto);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `포트폴리오 경력 수정 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/portfolios/career/{careerId}:
   *   delete:
   *     summary: 포트폴리오 경력 삭제
   *     description: 포트폴리오 경력을 삭제합니다.
   *     tags:
   *       - Portfolios
   *     parameters:
   *       - in: path
   *         name: careerId
   *         required: true
   *         schema:
   *           type: integer
   *         description: 삭제할 포트폴리오 경력 ID
   *     responses:
   *       200:
   *         description: 포트폴리오 경력 삭제 성공
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
   *                   example: 포트폴리오 경력 삭제 성공
   *       400:
   *         description: 유효성 검사 실패
   *       404:
   *         description: 해당 포트폴리오 경력이 존재하지 않음
   *       500:
   *         description: 서버 내부 오류
   */
  private async deleteCareer(request: Request, response: Response) {
    try {
      const careerId = Number(request.params.careerId);

      const result: DefaultResponse<{ id: number }> =
        await this.careerService.deleteCareer(careerId);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `포트폴리오 경력 삭제 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
