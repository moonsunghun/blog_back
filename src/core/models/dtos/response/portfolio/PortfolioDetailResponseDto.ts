import { Portfolio } from '../../../entities/portfolio/Portfolio';

/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioDetailResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: "포트폴리오 ID"
 *           example: 101
 *         title:
 *           type: string
 *           description: "포트폴리오 제목"
 *           example: "성장하는 개발자, 저를 소개합니다"
 *         contentFormat:
 *           type: string
 *           description: "본문 포맷 (예: HTML, Markdown)"
 *           example: "HTML"
 *         content:
 *           type: string
 *           description: "포트폴리오 본문 내용"
 *           example: "매일 작은 문제를 해결하며 한 걸음씩 성장하고 있는, 꾸준함을 강점으로 가진 개발자입니다."
 *         mainState:
 *           type: boolean
 *           example: true
 *           description: "메인 포트폴리오 여부"
 *         createDateTime:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *           description: "생성일시"
 *         updateDateTime:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *           description: "수정일시"
 */
export class PortfolioDetailResponseDto {
  readonly id!: number;
  readonly title!: string;
  readonly contentFormat!: string;
  readonly content!: string;
  readonly mainState!: boolean;
  readonly createDateTime!: Date;
  readonly updateDateTime?: Date | null;

  constructor(portfolio: Portfolio) {
    this.id = portfolio.id;
    this.title = portfolio.title;
    this.contentFormat = portfolio.contentFormat!;
    this.content = portfolio.content;
    this.mainState = portfolio.mainState;
    this.createDateTime = portfolio.createDateTime;
    this.updateDateTime = portfolio.updateDateTime ?? null;
  }
}
