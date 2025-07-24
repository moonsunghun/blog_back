import { Portfolio } from '../../../entities/portfolio/Portfolio';

/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioUpdateRequestDto:
 *       type: object
 *       required:
 *         - portfolioId
 *         - contentFormat
 *         - title
 *         - content
 *       properties:
 *         portfolioId:
 *           type: integer
 *           description: "수정할 포트폴리오 ID"
 *           example: 101
 *         contentFormat:
 *           type: string
 *           description: "본문 포맷"
 *           example: "HTML"
 *         title:
 *           type: string
 *           description: "포트폴리오 제목"
 *           example: "기초를 다지고, 원리를 파고드는 개발자"
 *         content:
 *           type: string
 *           description: "포트폴리오 본문 내용"
 *           example: "겉으로 드러나는 기능보다, 동작의 원리와 구조를 이해하며 탄탄한 기반 위에 코드를 쌓아가는 개발자입니다."
 */
export class PortfolioUpdateRequestDto {
  portfolioId!: number;

  contentFormat!: string;

  title!: string;

  content!: string;

  constructor(data?: Partial<PortfolioUpdateRequestDto>) {
    if (data) {
      if (data.portfolioId !== undefined) {
        this.portfolioId = data.portfolioId;
      }

      if (data.contentFormat !== undefined) {
        this.contentFormat = data.contentFormat;
      }

      if (data.title !== undefined) {
        this.title = data.title;
      }

      if (data.content !== undefined) {
        this.content = data.content;
      }
    }
  }

  toEntity(portfolioUpdateRequestDto: PortfolioUpdateRequestDto) {
    const portfolio = new Portfolio();

    portfolio.contentFormat = portfolioUpdateRequestDto.contentFormat;
    portfolio.title = portfolioUpdateRequestDto.title;
    portfolio.content = portfolioUpdateRequestDto.content;

    return portfolio;
  }
}
