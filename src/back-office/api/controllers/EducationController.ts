import { Request, Response, Router } from 'express';
import { validateRequest } from '../../../core/middlewares/ZodValidator';
import { DefaultResponse } from '../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../core/processor/CommonExceptionControllerResponseProcessor';
import { EducationService } from '../../../core/api/services/portfolio/EducationService';
import { EducationCreateRequestDto } from '../../../core/models/dtos/request/portfolio/education/EducationCreateRequestDto';
import { EducationCreateResponseDto } from '../../../core/models/dtos/response/portfolio/education/EducationCreateResponseDto';
import { EducationUpdateRequestDto } from '../../../core/models/dtos/request/portfolio/education/EducationUpdateRequestDto';
import { EducationUpdateResponseDto } from '../../../core/models/dtos/response/portfolio/education/EducationUpdateResponseDto';
import { EducationSchema, EducationIdSchema } from '../../../core/schemas/zod/EducationSchemas';
import { authenticationCheckForAdministrator } from '../../../core/middlewares/AuthenticationMiddleware';

export class EducationController {
  public readonly router: Router;
  private readonly educationService: EducationService;

  constructor() {
    this.router = Router();
    this.educationService = new EducationService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/portfolios/education',
      authenticationCheckForAdministrator,
      validateRequest({
        body: EducationSchema,
      }),
      this.createEducation.bind(this)
    );

    this.router.patch(
      '/portfolios/education/:educationId',
      authenticationCheckForAdministrator,
      validateRequest({
        params: EducationIdSchema,
        body: EducationSchema,
      }),
      this.updateEducation.bind(this)
    );

    this.router.delete(
      '/portfolios/education/:educationId',
      authenticationCheckForAdministrator,
      validateRequest({
        params: EducationIdSchema,
      }),
      this.deleteEducation.bind(this)
    );
  }

  /**
   * @swagger
   * /api/portfolios/education:
   *   post:
   *     summary: 포트폴리오 학력 작성
   *     description: 포트폴리오 학력을 작성합니다.
   *     tags:
   *       - Portfolios
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               schoolName:
   *                 type: string
   *                 description: "학교명"
   *                 example: "서울대학교"
   *               major:
   *                 type: string
   *                 description: "전공"
   *                 example: "컴퓨터공학과"
   *               degree:
   *                 type: string
   *                 description: "학위"
   *                 example: "학사"
   *               startDate:
   *                 type: string
   *                 description: "입학일"
   *                 example: "2018-03-01"
   *               endDate:
   *                 type: string
   *                 description: "졸업일"
   *                 example: "2022-03-01"
   *     responses:
   *       200:
   *         description: "포트폴리오 학력 생성 성공"
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
   *                   example: "포트폴리오 학력 생성 성공"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       description: "포트폴리오 학력 ID"
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
  private async createEducation(request: Request, response: Response) {
    try {
      const educationCreatedRequestDto = new EducationCreateRequestDto({
        schoolName: request.body.schoolName,
        major: request.body.major,
        degree: request.body.degree,
        startDate: request.body.startDate,
        endDate: request.body.endDate,
      });

      const result: DefaultResponse<EducationCreateResponseDto> =
        await this.educationService.createEducation(educationCreatedRequestDto);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `포트폴리오 학력 생성 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/portfolios/education/{educationId}:
   *   patch:
   *     summary: 포트폴리오 학력 수정
   *     tags:
   *       - Portfolios
   *     parameters:
   *       - in: path
   *         name: educationId
   *         required: true
   *         schema:
   *           type: integer
   *         description: 수정할 포트폴리오 학력 ID
   *     consumes:
   *       - application/json
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               schoolName:
   *                 type: string
   *                 description: "학교명"
   *                 example: "고려대학교"
   *               major:
   *                 type: string
   *                 description: "전공"
   *                 example: "전기전자공학과"
   *               degree:
   *                 type: string
   *                 description: "학위"
   *                 example: "석사"
   *               startDate:
   *                 type: string
   *                 description: "입학일"
   *                 example: "2020-03-01"
   *               endDate:
   *                 type: string
   *                 description: "졸업일"
   *                 example: "2024-03-01"
   *     responses:
   *       200:
   *         description: 포트폴리오 학력 수정 성공
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
   *                   example: 포트폴리오 학력 수정 성공
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
  private async updateEducation(request: Request, response: Response) {
    try {
      const educationUpdateRequestDto = new EducationUpdateRequestDto({
        educationId: Number(request.params.educationId),
        schoolName: request.body.schoolName,
        major: request.body.major,
        degree: request.body.degree,
        startDate: request.body.startDate,
        endDate: request.body.endDate,
      });

      const result: DefaultResponse<EducationUpdateResponseDto> =
        await this.educationService.updateEducation(educationUpdateRequestDto);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `포트폴리오 학력 수정 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/portfolios/education/{educationId}:
   *   delete:
   *     summary: 포트폴리오 학력 삭제
   *     description: 포트폴리오 학력을 삭제합니다.
   *     tags:
   *       - Portfolios
   *     parameters:
   *       - in: path
   *         name: educationId
   *         required: true
   *         schema:
   *           type: integer
   *         description: 삭제할 포트폴리오 학력 ID
   *     responses:
   *       200:
   *         description: 포트폴리오 학력 삭제 성공
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
   *                   example: 포트폴리오 학력 삭제 성공
   *       400:
   *         description: 유효성 검사 실패
   *       404:
   *         description: 해당 포트폴리오 학력이 존재하지 않음
   *       500:
   *         description: 서버 내부 오류
   */
  private async deleteEducation(request: Request, response: Response) {
    try {
      const educationId = Number(request.params.educationId);

      const result: DefaultResponse<{ id: number }> =
        await this.educationService.deleteEducation(educationId);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `포트폴리오 학력 삭제 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
