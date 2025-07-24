import { Portfolio } from '../../../entities/portfolio/Portfolio';

/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioCreateRequestDto:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 150
 *           example: "홍길동의 포트폴리오"
 *           description: "포트폴리오 제목"
 *         contentFormat:
 *           type: string
 *           example: "HTML"
 *           description: "포트폴리오 포맷 (HTML, Markdown 등)"
 *         content:
 *           type: string
 *           minLength: 10
 *           example: "일하고 싶습니다!"
 *           description: "포트폴리오 내용"
 */

export class PortfolioCreateRequestDto {
  contentFormat!: string;

  title!: string;

  content!: string;

  constructor(data?: Partial<PortfolioCreateRequestDto>) {
    if (data) {
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

  toEntity(portfolioCreateRequestDto: PortfolioCreateRequestDto): Portfolio {
    const portfolio = new Portfolio();

    portfolio.title = portfolioCreateRequestDto.title;
    portfolio.contentFormat = portfolioCreateRequestDto.contentFormat;
    portfolio.content = portfolioCreateRequestDto.content;
    portfolio.mainState = false;

    return portfolio;
  }
}
