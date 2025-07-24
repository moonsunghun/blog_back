/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioDetailRequestDto:
 *       type: object
 *       required:
 *         - portfolioId
 *       properties:
 *         portfolioId:
 *           type: integer
 *           description: "조회할 포트폴리오 ID"
 *           example: 42
 */
export class PortfolioDetailRequestDto {
  portfolioId!: number;

  constructor(data?: { portfolioId?: any }) {
    if (data) {
      if (data.portfolioId !== undefined) {
        this.portfolioId = Number(data.portfolioId);
      }
    }
  }
}
