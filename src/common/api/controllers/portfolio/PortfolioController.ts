import { Request, Response, Router } from 'express';
import { DefaultResponse } from '../../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../../core/processor/CommonExceptionControllerResponseProcessor';
import { PortfolioService } from '../../../../core/api/services/portfolio/PortfolioService';
import { PortfolioDetailResponseDto } from '../../../../core/models/dtos/response/portfolio/PortfolioDetailResponseDto';

/**
 * @swagger
 * tags:
 *   name: Portfolios
 *   description: 포트폴리오 관련 API
 */
export class PortfolioController {
  public readonly router: Router;
  private readonly portfolioService: PortfolioService;

  constructor() {
    this.router = Router();
    this.portfolioService = new PortfolioService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/portfolios/main', this.getDetailMainPortfolio.bind(this));
  }

  /**
   * @swagger
   * /api/portfolios/main:
   *   get:
   *     summary: 메인 포트폴리오 상세 조회
   *     tags:
   *       - Portfolios
   *     responses:
   *       200:
   *         description: "메인 포트폴리오 상세 조회 성공"
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PortfolioDetailResponseDto'
   *       404:
   *         description: "메인 포트폴리오를 찾을 수 없음"
   *       500:
   *         description: "서버 내부 오류"
   */
  private async getDetailMainPortfolio(request: Request, response: Response) {
    try {
      const result: DefaultResponse<PortfolioDetailResponseDto> =
        await this.portfolioService.getDetailMainPortfolio();

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        '메인 포트폴리오 상세 조회 실패'
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
