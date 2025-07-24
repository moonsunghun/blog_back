import { Request, Response, Router } from 'express';
import { DefaultResponse } from '../../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../../core/processor/CommonExceptionControllerResponseProcessor';
import { EducationService } from '../../../../core/api/services/portfolio/EducationService';

export class EducationController {
  public readonly router: Router;
  private readonly educationService: EducationService;

  constructor() {
    this.router = Router();
    this.educationService = new EducationService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/portfolios/education', this.getEducationList.bind(this));
  }

  /**
   * @swagger
   * /api/portfolios/education:
   *   get:
   *     summary: 포트폴리오 학력 목록 조회
   *     tags:
   *       - Portfolios
   *     responses:
   *       200:
   *         description: 포트폴리오 학력 목록 조회 성공
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
   *                   example: 포트폴리오 학력 목록 조회 성공
   *                 data:
   *                   type: object
   *                   properties:
   *                     educations:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 1
   *                           schoolName:
   *                             type: string
   *                             example: "고려대학교"
   *                           major:
   *                             type: string
   *                             example: "전기전자공학과"
   *                           degree:
   *                             type: string
   *                             example: "석사"
   *                           startDate:
   *                             type: string
   *                             format: date-time
   *                             example: "2020-01-01"
   *                           endDate:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-01"
   *       500:
   *         description: 서버 내부 오류
   */

  private async getEducationList(request: Request, response: Response) {
    try {
      const result = await this.educationService.getEducationList();

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `포트폴리오 학력 목록 조회 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
