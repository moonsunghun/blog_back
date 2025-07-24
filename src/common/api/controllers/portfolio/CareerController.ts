import { Request, Response, Router } from 'express';
import { DefaultResponse } from '../../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../../core/processor/CommonExceptionControllerResponseProcessor';
import { CareerService } from '../../../../core/api/services/portfolio/CareerService';

export class CareerController {
  public readonly router: Router;
  private readonly careerService: CareerService;

  constructor() {
    this.router = Router();
    this.careerService = new CareerService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/portfolios/career', this.getCareerList.bind(this));
  }

  /**
   * @swagger
   * /api/portfolios/career:
   *   get:
   *     summary: 포트폴리오 경력 목록 조회
   *     tags:
   *       - Portfolios
   *     responses:
   *       200:
   *         description: 포트폴리오 경력 목록 조회 성공
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
   *                   example: 포트폴리오 경력 목록 조회 성공
   *                 data:
   *                   type: object
   *                   properties:
   *                     careers:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 1
   *                           companyName:
   *                             type: string
   *                             example: "카카오"
   *                           position:
   *                             type: string
   *                             example: "프론트엔드 개발자"
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

  private async getCareerList(request: Request, response: Response) {
    try {
      const result = await this.careerService.getCareerList();

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `포트폴리오 경력 목록 조회 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
