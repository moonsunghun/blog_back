/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioUpdateResponseDto:
 *       type: object
 *       properties:
 *         portfolioId:
 *           type: integer
 *           description: "수정된 포트폴리오 ID"
 *           example: 1
 */
export class PortfolioUpdateResponseDto {
  readonly portfolioId!: number;

  constructor(portfolioId: number) {
    this.portfolioId = portfolioId;
  }
}
