import { Request, Response, Router } from 'express';
import { DefaultResponse } from '../../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../../core/processor/CommonExceptionControllerResponseProcessor';
import { InquiryService } from '../../../../core/api/services/inquiry/InquiryService';
import { InquirySearchOrderColumn, OrderBy } from '../../../../core/types/Enum';
import { InquirySearchRequestDto } from '../../../../core/models/dtos/request/inquiry/InquirySearchRequestDto';
import { InquiryListResponseDto } from '../../../../core/models/dtos/response/inquiry/InquiryListResponseDto';
import { InquiryDetailSearchRequestDto } from '../../../../core/models/dtos/request/inquiry/InquiryDetailSearchRequestDto';
import { InquiryDetailResponseDto } from '../../../../core/models/dtos/response/inquiry/InquiryDetailResponseDto';
import { validateRequest } from '../../../../core/middlewares/ZodValidator';
import {
  detailSearchInquiryProcessTypeSchema,
  inquiryIdSchema,
  inquirySearchRequestSchema,
} from '../../../../core/schemas/zod/InquirySchemas';

/**
 * @swagger
 * tags:
 *   name: Inquiries
 *   description: 문의 관련 API
 */
export class InquiryController {
  public readonly router: Router;
  private readonly inquiryService: InquiryService;

  constructor() {
    this.router = Router();
    this.inquiryService = new InquiryService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      '/inquiries',
      validateRequest({
        query: inquirySearchRequestSchema,
      }),
      this.getInquiryListWithSearch.bind(this)
    );

    this.router.get(
      '/inquiries/:inquiryId',
      validateRequest({
        params: inquiryIdSchema,
        query: detailSearchInquiryProcessTypeSchema,
      }),
      this.getDetailInquiry.bind(this)
    );
  }

  /**
   * @swagger
   * /api/inquiries:
   *   get:
   *     summary: 문의 게시글 목록 조회 (검색 및 정렬 포함)
   *     description: 제목, 작성자, 답변 상태, 본문 내용으로 검색 가능하며 정렬 및 페이징 처리가 가능합니다.
   *     tags:
   *       - Inquiries
   *     parameters:
   *       - name: pageNumber
   *         in: query
   *         required: false
   *         schema:
   *           type: integer
   *           default: 1
   *         description: 페이지 번호
   *       - name: perPageSize
   *         in: query
   *         required: false
   *         schema:
   *           type: integer
   *           default: 10
   *         description: 페이지 당 항목 수
   *       - name: orderColumn
   *         in: query
   *         required: false
   *         schema:
   *           type: string
   *           enum: [createDateTime, title, writer]
   *         description: 정렬 기준 컬럼
   *       - name: orderBy
   *         in: query
   *         required: false
   *         schema:
   *           type: string
   *           enum: [ASC, DESC]
   *         description: 정렬 방향 (오름차순/내림차순)
   *       - name: title
   *         in: query
   *         required: false
   *         schema:
   *           type: string
   *         description: 제목 검색어
   *       - name: writer
   *         in: query
   *         required: false
   *         schema:
   *           type: string
   *         description: 작성자(닉네임 또는 이메일)
   *       - name: answerStatus
   *         in: query
   *         required: false
   *         schema:
   *           type: boolean
   *         description: 답변 완료 여부 (false 시 미답변만 조회)
   *       - name: content
   *         in: query
   *         required: false
   *         schema:
   *           type: string
   *         description: 본문 내용 검색어
   *     responses:
   *       200:
   *         description: 문의 목록 조회 성공
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
   *                   example: "문의 목록 조회 성공"
   *                 data:
   *                   type: object
   *                   properties:
   *                     currentPage:
   *                       type: integer
   *                       example: 1
   *                     perPageSize:
   *                       type: integer
   *                       example: 10
   *                     totalCount:
   *                       type: integer
   *                       example: 45
   *                     totalPage:
   *                       type: integer
   *                       example: 5
   *                     results:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/InquiryListResponseDto'
   *       500:
   *         description: 서버 내부 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  private async getInquiryListWithSearch(request: Request, response: Response) {
    try {
      const inquirySearchRequestDto = new InquirySearchRequestDto({
        pageNumber: Number(request.query.pageNumber) || 1,
        perPageSize: Number(request.query.perPageSize) || 10,
        orderColumn: request.query.orderColumn as InquirySearchOrderColumn,
        orderBy: request.query.orderBy as OrderBy,
        title: request.query.title as string,
        writer: request.query.writer as string,
        answerStatus: request.query.answerStatus === 'false',
        content: request.query.content as string,
      });

      const result: DefaultResponse<InquiryListResponseDto> =
        await this.inquiryService.getInquiryListWithSearch(inquirySearchRequestDto);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        '문의 목록 조회 실패'
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/inquiries/{inquiryId}:
   *   get:
   *     summary: 특정 문의 게시글 상세 조회
   *     description: |
   *       - 회원 또는 비회원이 특정 문의 게시글의 상세 정보를 조회합니다.
   *       - 댓글 및 답글을 포함하고 싶을 경우 `processType=true`를 사용합니다.
   *       - 비회원이 작성한 게시글의 경우, 비밀번호 인증이 필요한 경우 쿠키(`guestPassword-{inquiryId}`)를 통해 자동 인증됩니다.
   *     tags:
   *       - Inquiries
   *     parameters:
   *       - name: inquiryId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: 조회할 문의 게시글 ID
   *       - name: processType
   *         in: query
   *         required: false
   *         schema:
   *           type: boolean
   *           default: false
   *         description: 댓글 및 답글 포함 여부 (true 시 포함)
   *     responses:
   *       200:
   *         description: 문의 상세 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/InquiryDetailResponseDto'
   *       403:
   *         description: 비회원 비밀번호 인증 실패 (쿠키 없음 또는 불일치)
   *       404:
   *         description: 해당 문의를 찾을 수 없음
   *       500:
   *         description: 서버 내부 오류
   */
  private async getDetailInquiry(request: Request, response: Response) {
    try {
      const inquiryDetailSearchRequestDto = new InquiryDetailSearchRequestDto({
        inquiryId: request.params.inquiryId,
        processType:
          typeof request.query.processType === 'string'
            ? request.query.processType === 'true'
            : Boolean(request.query.processType),
      });

      const result: DefaultResponse<InquiryDetailResponseDto> =
        await this.inquiryService.getDetailInquiry(request, inquiryDetailSearchRequestDto);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        '문의 상세 조회 실패'
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
