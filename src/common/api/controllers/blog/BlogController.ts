// blogs 관련 API 컨트롤러 (목록 조회 등)

import { Request, Response, Router } from 'express';
import { DefaultResponse } from '../../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../../core/processor/CommonExceptionControllerResponseProcessor';
import { BlogService } from '../../../../core/api/services/blog/BlogService';
import { BlogSearchRequestDto } from '../../../../core/models/dtos/request/blog/BlogSearchRequestDto';
import { validateRequest } from '../../../../core/middlewares/ZodValidator';
import {
  blogSearchSchema,
  blogIdSchema,
  detailSearchBlogProcessTypeSchema,
} from '../../../../core/schemas/zod/BlogSchemas';
import { BlogDetailSearchRequestDto } from '../../../../core/models/dtos/request/blog/BlogDetailSearchRequestDto';
import { BlogDetailResponseDto } from '../../../../core/models/dtos/response/blog/BlogDetailResponseDto';
/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: 블로그 관련 API
 */
export class BlogController {
  public readonly router: Router;
  private readonly blogService: BlogService;

  constructor() {
    this.router = Router();
    this.blogService = new BlogService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      '/blogs',
      validateRequest({
        query: blogSearchSchema,
      }),
      this.getBlogListWithSearch.bind(this)
    );

    this.router.get(
      '/blogs/:blogId',
      validateRequest({
        params: blogIdSchema,
        query: detailSearchBlogProcessTypeSchema,
      }),
      this.getDetailBlog.bind(this)
    );
  }

  /**
   * @swagger
   * /api/blogs:
   *   get:
   *     summary: 블로그 게시글 목록 조회
   *     description: 블로그 게시글을 페이징 처리하여 반환합니다.
   *     tags:
   *       - Blogs
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
   *         description: 페이지 당 항목 수
   *       - in: query
   *         name: orderBy
   *         schema:
   *           type: string
   *           enum: [ASC, DESC]
   *           default: DESC
   *         description: 정렬 순서
   *       - in: query
   *         name: title
   *         schema:
   *           type: string
   *         description: 제목 검색
   *     responses:
   *       200:
   *         description: 블로그 목록 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BlogListResponseDto'
   *       400:
   *         description: 유효성 검사 실패
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DefaultResponse'
   *       500:
   *         description: 서버 내부 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  private async getBlogListWithSearch(request: Request, response: Response) {
    try {
      const blogSearchRequestDto = new BlogSearchRequestDto({
        pageNumber: Number(request.query.pageNumber) || 1,
        perPageSize: Number(request.query.perPageSize) || 10,
        title: (request.query.title as string) || '',
      });

      const result = await this.blogService.getBlogListWithSearch(blogSearchRequestDto);
      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        '블로그 목록 조회 실패'
      );
      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   *  @swagger
   * /api/blogs/{blogId}:
   *   get:
   *     summary: 블로그 게시글 상세 조회
   *     description: 블로그 게시글의 상세 정보를 반환합니다.
   *     tags:
   *       - Blogs
   *     parameters:
   *       - in: path
   *         name: blogId
   *         required: true
   *         schema:
   *           type: integer
   *         description: 블로그 게시글 ID
   *       - in: query
   *         name: processType
   *         required: false
   *         schema:
   *           type: boolean
   *           default: false
   *         description: 프로세스 타입 (확장용)
   *     responses:
   *       200:
   *         description: 블로그 상세 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BlogDetailResponseDto'
   *       400:
   *         description: 유효성 검사 실패
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DefaultResponse'
   *       404:
   *         description: 블로그 게시글을 찾을 수 없음
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DefaultResponse'
   *       500:
   *         description: 서버 내부 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  private async getDetailBlog(request: Request, response: Response) {
    try {
      const blogDetailSearchRequestDto = new BlogDetailSearchRequestDto({
        blogId: Number(request.params.blogId),
        processType:
          typeof request.query.processType === 'string'
            ? request.query.processType === 'true'
            : Boolean(request.query.processType),
      });

      const result: DefaultResponse<BlogDetailResponseDto> = await this.blogService.getDetailBlog(
        blogDetailSearchRequestDto
      );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        '블로그 상세 조회 실패'
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
