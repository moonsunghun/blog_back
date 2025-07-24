/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioCreateResponseDto:
 *       type: object
 *       properties:
 *         portfolioId:
 *           type: number
 *           example: 1
 *         mainState:
 *           type: boolean
 *           example: true
 */
export class PortfolioCreateResponseDto {
  portfolioId: number;
  mainState: boolean;

  constructor(portfolioId: number, mainState: boolean = false) {
    this.portfolioId = portfolioId;
    this.mainState = mainState;
  }
}
