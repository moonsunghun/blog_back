/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioSetMainResponseDto:
 *       type: object
 *       properties:
 *         newMainPortfolioId:
 *           type: integer
 *           example: 2
 *           description: "새로운 메인 포트폴리오 ID"
 */
export class PortfolioSetMainResponseDto {
  newMainPortfolioId: number;

  constructor(newMainPortfolioId: number) {
    this.newMainPortfolioId = newMainPortfolioId;
  }
}
