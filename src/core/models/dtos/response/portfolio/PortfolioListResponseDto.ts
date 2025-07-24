import { Portfolio } from '../../../../models/entities/portfolio/Portfolio';

/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioListResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *           description: "포트폴리오 고유 ID"
 *         title:
 *           type: string
 *           example: "포트폴리오 제목"
 *           description: "포트폴리오 제목"
 *         contentFormat:
 *           type: string
 *           example: "HTML"
 *           description: "포트폴리오 포맷"
 *         mainState:
 *           type: boolean
 *           example: true
 *           description: "메인 포트폴리오 여부"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *           description: "생성일시"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *           description: "수정일시"
 */
export class PortfolioListResponseDto {
  id!: number;
  title!: string;
  contentFormat!: string;
  mainState!: boolean;
  createDateTime!: Date;
  updateDateTime?: Date;

  constructor(portfolio: Portfolio) {
    this.id = portfolio.id;
    this.title = portfolio.title;
    this.contentFormat = portfolio.contentFormat;
    this.mainState = portfolio.mainState;
    this.createDateTime = portfolio.createDateTime;
    this.updateDateTime = portfolio.updateDateTime;
  }
}
