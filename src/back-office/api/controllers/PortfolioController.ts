import { Request, Response, Router } from 'express';
import { validateRequest } from '../../../core/middlewares/ZodValidator';
import { DefaultResponse } from '../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../core/processor/CommonExceptionControllerResponseProcessor';
import { PortfolioService } from '../../../core/api/services/portfolio/PortfolioService';
import { PortfolioCreateRequestDto } from '../../../core/models/dtos/request/portfolio/PortfolioCreateRequestDto';
import { PortfolioCreateResponseDto } from '../../../core/models/dtos/response/portfolio/PortfolioCreateResponseDto';
import { PortfolioUpdateRequestDto } from '../../../core/models/dtos/request/portfolio/PortfolioUpdateRequestDto';
import { PortfolioUpdateResponseDto } from '../../../core/models/dtos/response/portfolio/PortfolioUpdateResponseDto';
import { PortfolioDetailRequestDto } from '../../../core/models/dtos/request/portfolio/PortfolioDetailRequestDto';
import { PortfolioDetailResponseDto } from '../../../core/models/dtos/response/portfolio/PortfolioDetailResponseDto';
import { PortfolioSetMainRequestDto } from '../../../core/models/dtos/request/portfolio/PortfolioSetMainRequestDto';
import { PortfolioSetMainResponseDto } from '../../../core/models/dtos/response/portfolio/PortfolioSetMainResponseDto';
import { PageRequestDto } from '../../../core/models/dtos/request/PageRequestDto';
import { OrderBy } from '../../../core/types/Enum';
import {
  portfolioRegisterSchema,
  portfolioUpdateSchema,
  portfolioIdSchema,
} from '../../../core/schemas/zod/PortfolioSchemas';
import {
  authenticationCheckForAdministrator,
  authenticationCheckForAdministratorAndUser,
} from '../../../core/middlewares/AuthenticationMiddleware';

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
    this.router.get(
      '/portfolios',
      authenticationCheckForAdministrator,
      this.getPortfolioList.bind(this)
    );

    this.router.get(
      '/portfolios/:portfolioId',
      authenticationCheckForAdministratorAndUser,
      validateRequest({
        params: portfolioIdSchema,
      }),
      this.getDetailPortfolio.bind(this)
    );

    this.router.post(
      '/portfolios',
      authenticationCheckForAdministrator,
      validateRequest({ body: portfolioRegisterSchema }),
      this.createPortfolio.bind(this)
    );

    this.router.patch(
      '/portfolios/:portfolioId',
      authenticationCheckForAdministrator,
      validateRequest({
        params: portfolioIdSchema,
        body: portfolioUpdateSchema,
      }),
      this.updatePortfolio.bind(this)
    );

    this.router.patch(
      '/portfolios/:portfolioId/main-state',
      authenticationCheckForAdministrator,
      validateRequest({
        params: portfolioIdSchema,
      }),
      this.setPortfolioMain.bind(this)
    );

    this.router.delete(
      '/portfolios/:portfolioId',
      authenticationCheckForAdministrator,
      validateRequest({
        params: portfolioIdSchema,
      }),
      this.deletePortfolio.bind(this)
    );
  }

  /**
   * @swagger
   * /api/portfolios:
   *   get:
   *     summary: 포트폴리오 목록 조회
   *     description: 포트폴리오 목록을 페이징하여 조회합니다.
   *     tags:
   *       - Portfolios
   *     parameters:
   *       - in: query
   *         name: pageNumber
   *         schema:
   *           type: integer
   *           default: 1
   *         description: 페이지 번호
   *       - in: query
   *         name: perPageSize
   *         schema:
   *           type: integer
   *           default: 10
   *         description: 페이지당 항목 수
   *       - in: query
   *         name: orderBy
   *         schema:
   *           type: string
   *           enum: [ASC, DESC]
   *           default: DESC
   *         description: 정렬 순서 (생성일시 기준)
   *     responses:
   *       200:
   *         description: 포트폴리오 목록 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 statusCode:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: 포트폴리오 목록 조회 성공
   *                 data:
   *                   type: object
   *                   properties:
   *                     perPageSize:
   *                       type: integer
   *                       example: 10
   *                     totalCount:
   *                       type: integer
   *                       example: 25
   *                     totalPage:
   *                       type: integer
   *                       example: 3
   *                     data:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 1
   *                           title:
   *                             type: string
   *                             example: "포트폴리오 제목"
   *                           contentFormat:
   *                             type: string
   *                             example: "HTML"
   *                           mainState:
   *                             type: boolean
   *                             example: true
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-01T00:00:00.000Z"
   *                           updatedAt:
   *                             type: string
   *                             format: date-time
   *                             example: "2024-01-01T00:00:00.000Z"
   *       500:
   *         description: 서버 내부 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */

  private async getPortfolioList(request: Request, response: Response) {
    try {
      const pageRequestDto = new PageRequestDto({
        pageNumber: parseInt(request.query.pageNumber as string) || 1,
        perPageSize: parseInt(request.query.perPageSize as string) || 10,
        orderBy: (request.query.orderBy as string) === 'ASC' ? OrderBy.ASC : OrderBy.DESC,
      });

      const result = await this.portfolioService.getPortfolioList(pageRequestDto);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `포트폴리오 목록 조회 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/portfolios/{portfolioId}:
   *   get:
   *     summary: 특정 포트폴리오 상세 조회
   *     tags:
   *       - Portfolios
   *     parameters:
   *       - name: portfolioId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: "조회할 포트폴리오 ID"
   *     responses:
   *       200:
   *         description: "포트폴리오 상세 조회 성공"
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PortfolioDetailResponseDto'
   *       404:
   *         description: "해당 포트폴리오를 찾을 수 없음"
   *       500:
   *         description: "서버 내부 오류"
   */
  private async getDetailPortfolio(request: Request, response: Response) {
    try {
      const portfolioDetailRequestDto = new PortfolioDetailRequestDto({
        portfolioId: Number(request.params.portfolioId),
      });

      const result: DefaultResponse<PortfolioDetailResponseDto> =
        await this.portfolioService.getDetailPortfolio(portfolioDetailRequestDto);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        '포트폴리오 상세 조회 실패'
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/portfolios:
   *   post:
   *     summary: 포트폴리오 작성
   *     description: 포트폴리오를 작성합니다.<br>이미지는 base64 형식 인코딩되어 content에 포함해 전달합니다. content는 최소 10자 이상이어야 합니다.<br><br>작성한 포트폴리오의 메인 여부는 false로 설정됩니다.<br>단, 기존에 작성된 포트폴리오가 하나도 없을 경우 새로 작성한 포트폴리오가 자동으로 메인 포트폴리오로 설정됩니다.
   *     tags:
   *       - Portfolios
   *     consumes:
   *       - application/json
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               contentFormat:
   *                 type: string
   *                 description: "본문 포맷 (HTML, Markdown 등)"
   *                 example: "HTML"
   *               title:
   *                 type: string
   *                 description: "포트폴리오 제목"
   *                 example: "메인 포트폴리오입니다."
   *               content:
   *                 type: string
   *                 description: "포트폴리오 본문 내용"
   *                 example: "배우고 성장할 수 있는 환경에서, 팀과 함께 일하며 기여하고 싶습니다."
   *     responses:
   *       201:
   *         description: 포트폴리오 작성 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 201
   *                 message:
   *                   type: string
   *                   example: 포트폴리오 작성 성공
   *                 data:
   *                   type: number
   *                   example: 1
   *       400:
   *         description: 유효성 검사 실패
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: 서버 내부 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */

  private async createPortfolio(request: Request, response: Response) {
    try {
      const portfolioCreatedRequestDto = new PortfolioCreateRequestDto({
        contentFormat: request.body.contentFormat,
        title: request.body.title,
        content: request.body.content,
      });

      const result: DefaultResponse<PortfolioCreateResponseDto> =
        await this.portfolioService.createPortfolio(portfolioCreatedRequestDto);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `포트폴리오 생성 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/portfolios/{portfolioId}:
   *   patch:
   *     summary: 포트폴리오 수정
   *     tags:
   *       - Portfolios
   *     parameters:
   *       - in: path
   *         name: portfolioId
   *         required: true
   *         schema:
   *           type: integer
   *         description: 수정할 포트폴리오 ID
   *     consumes:
   *       - application/json
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               contentFormat:
   *                 type: string
   *                 description: "본문 포맷 (HTML, Markdown 등)"
   *                 example: "HTML"
   *               title:
   *                 type: string
   *                 description: "포트폴리오 제목"
   *                 example: "기초를 다지고, 원리를 파고드는 개발자"
   *               content:
   *                 type: string
   *                 description: "포트폴리오 본문 내용"
   *                 example: "동작의 원리와 구조를 이해하며 탄탄한 기반 위에 코드를 쌓아가는 개발자입니다."
   *     responses:
   *       200:
   *         description: 포트폴리오 수정 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: 포트폴리오 수정 성공
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     mainState:
   *                       type: boolean
   *                       example: false
   *       400:
   *         description: 유효성 검사 실패
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: 포트폴리오를 찾을 수 없음
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: 서버 내부 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */

  private async updatePortfolio(request: Request, response: Response) {
    try {
      const portfolioUpdateRequestDto = new PortfolioUpdateRequestDto({
        portfolioId: Number(request.params.portfolioId),
        contentFormat: request.body.contentFormat,
        title: request.body.title,
        content: request.body.content,
      });

      const result: DefaultResponse<PortfolioUpdateResponseDto> =
        await this.portfolioService.updatePortfolio(portfolioUpdateRequestDto);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `포트폴리오 수정 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/portfolios/{portfolioId}:
   *   delete:
   *     summary: 포트폴리오 삭제
   *     description: 포트폴리오를 삭제합니다.<br>메인 포트폴리오는 삭제할 수 없습니다.
   *     tags:
   *       - Portfolios
   *     parameters:
   *       - in: path
   *         name: portfolioId
   *         required: true
   *         schema:
   *           type: integer
   *         description: 삭제할 포트폴리오 ID
   *     responses:
   *       200:
   *         description: 포트폴리오 삭제 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: 포트폴리오 삭제 성공
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *       400:
   *         description: 메인 포트폴리오 삭제 시도 또는 유효성 검사 실패
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: 해당 포트폴리오가 존재하지 않음
   *       500:
   *         description: 서버 내부 오류
   */

  private async deletePortfolio(request: Request, response: Response) {
    try {
      const portfolioId = Number(request.params.portfolioId);

      const result: DefaultResponse<{ id: number }> =
        await this.portfolioService.deletePortfolio(portfolioId);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `포트폴리오 삭제 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/portfolios/{portfolioId}/main-state:
   *   patch:
   *     summary: 포트폴리오를 메인으로 설정
   *     description: 포트폴리오를 메인 포트폴리오로 설정합니다.<br>기존의 메인 포트폴리오는 메인 여부가 false로 변경됩니다.
   *     tags:
   *       - Portfolios
   *     parameters:
   *       - in: path
   *         name: portfolioId
   *         required: true
   *         schema:
   *           type: integer
   *         description: 메인으로 설정할 포트폴리오 ID
   *     responses:
   *       200:
   *         description: 포트폴리오 메인 설정 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: 메인 포트폴리오로 설정 성공
   *                 data:
   *                   type: object
   *                   properties:
   *                     portfolioId:
   *                       type: integer
   *                       example: 1
   *                     mainState:
   *                       type: boolean
   *                       example: true
   *       400:
   *         description: 유효성 검사 실패
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: 포트폴리오를 찾을 수 없음
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: 서버 내부 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */

  private async setPortfolioMain(request: Request, response: Response) {
    try {
      const portfolioSetMainRequestDto = new PortfolioSetMainRequestDto({
        portfolioId: Number(request.params.portfolioId),
      });

      const result: DefaultResponse<PortfolioSetMainResponseDto> =
        await this.portfolioService.setPortfolioMain(portfolioSetMainRequestDto);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `포트폴리오 메인 설정 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
