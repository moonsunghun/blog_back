import { Portfolio } from '../../../entities/portfolio/Portfolio';

/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioSetMainRequestDto:
 *       type: object
 *       required:
 *         - portfolioId
 *       properties:
 *         portfolioId:
 *           type: integer
 *           example: 1
 *           description: "새로운 메인 포트폴리오 ID"
 */
export class PortfolioSetMainRequestDto {
  portfolioId!: number;

  constructor(data?: Partial<PortfolioSetMainRequestDto>) {
    if (data) {
      if (data.portfolioId !== undefined) {
        this.portfolioId = data.portfolioId;
      }
    }
  }

  toEntity(mainState: boolean) {
    const portfolio = new Portfolio();

    portfolio.mainState = mainState;

    return portfolio;
  }
}
