// blogs 관련 API 컨트롤러 (목록 조회 등)

import { Request, Response, Router } from 'express';
import { DefaultResponse } from '../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../core/processor/CommonExceptionControllerResponseProcessor';
import { BlogService } from '../../../core/api/services/blog/BlogService';
import { BlogCreateRequestDto } from '../../../core/models/dtos/request/blog/BlogCreateRequestDto';
import { validateRequest } from '../../../core/middlewares/ZodValidator';
import {
  blogIdSchema,
  blogRegisterSchema,
  blogUpdateSchema,
} from '../../../core/schemas/zod/BlogSchemas';
import { BlogCreateResponseDto } from '../../../core/models/dtos/response/blog/BlogCreateResponseDto';
import { BlogUpdateRequestDto } from '../../../core/models/dtos/request/blog/BlogUpdateRequestDto';
import { BlogUpdateResponseDto } from '../../../core/models/dtos/response/blog/BlogUpdateResponseDto';
import { translateTextToEnglish } from '../../../ai-service';
import { User } from '../../../core/models/entities/User';
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
    this.router.post(
      '/blogs',
      validateRequest({
        body: blogRegisterSchema,
      }),
      this.createBlog.bind(this)
    );

    this.router.patch(
      '/blogs/:blogId',
      validateRequest({
        params: blogIdSchema,
        body: blogUpdateSchema,
      }),
      this.updateBlog.bind(this)
    );

    this.router.delete(
      '/blogs/:blogId',
      validateRequest({
        params: blogIdSchema,
      }),
      this.deleteBlog.bind(this)
    );
  }

  /**
   * @swagger
   * /api/blogs:
   *   post:
   *     summary: 블로그 게시글 작성
   *     description: 블로그 게시글을 작성합니다.
   *     tags:
   *       - Blogs
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: integer
   *                 example: 1
   *               title:
   *                 type: string
   *                 example: 'Next.js 14 신규 기능 정리'
   *               preview:
   *                 type: string
   *                 example: '이 글은 Next.js 14의 주요 기능을 정리합니다.'
   *               content:
   *                 type: string
   *                 example: '<p>Next.js 14에서는 ...</p>'
   *               contentSummary:
   *                 type: string
   *                 example: '이 글은 ...'
   *               category:
   *                 type: string
   *                 example: '기술'
   *     responses:
   *       201:
   *         description: 게시글 작성 성공
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
   *                   example: 블로그 게시글 작성 성공
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
  private async createBlog(request: Request, response: Response) {
    try {
      const user: User | null = request.user
        ? ({
            id: request.user.id,
            email: request.user.email,
            nickName: '', // 필요한 경우 데이터베이스에서 조회
            password: '',
            userType: request.user.role,
            loginAttemptCount: 0,
            blockState: false,
            withdrawnDateTime: null,
          } as User)
        : null;

      const blogCreateRequestDto = new BlogCreateRequestDto({
        userId: user?.id,
        title: request.body.title,
        preview: request.body.preview,
        content: request.body.content,
        contentSummary: request.body.contentSummary,
        category: request.body.category,
        contentEnglish: await translateTextToEnglish(request.body.content),
      });

      const result: DefaultResponse<BlogCreateResponseDto> =
        await this.blogService.createBlog(blogCreateRequestDto);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(
          error,
          '블로그 게시글 작성 실패'
        );

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/blogs/{blogId}:
   *   patch:
   *     summary: 블로그 게시글 수정
   *     description: 블로그 게시글의 내용을 수정합니다.
   *     tags:
   *       - Blogs
   *     parameters:
   *       - name: blogId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: 수정할 블로그 게시글 ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 description: 블로그 제목
   *                 example: 'Next.js 14 신규 기능 정리'
   *               preview:
   *                 type: string
   *                 description: 블로그 미리보기
   *                 example: '이 글은 Next.js 14의 주요 기능을 정리합니다.'
   *               content:
   *                 type: string
   *                 description: 블로그 본문 내용
   *                 example: '<p>Next.js 14에서는 ...</p>'
   *               contentSummary:
   *                 type: string
   *                 description: 블로그 요약
   *                 example: '이 글은 ...'
   *               category:
   *                 type: string
   *                 description: 블로그 카테고리
   *                 example: '기술'
   *     responses:
   *       200:
   *         description: 블로그 수정 성공
   *         content:
   *           application/json:
   *             schema:
   *       400:
   *         description: 요청 형식 오류
   *       404:
   *         description: 해당 블로그 게시글 없음
   *       500:
   *         description: 서버 내부 오류
   */
  private async updateBlog(request: Request, response: Response) {
    try {
      const blogUpdateRequestDto = new BlogUpdateRequestDto({
        blogId: Number(request.params.blogId),
        title: request.body.title,
        preview: request.body.preview,
        content: request.body.content,
        contentSummary: request.body.contentSummary,
        category: request.body.category,
      });

      const result: DefaultResponse<BlogUpdateResponseDto> =
        await this.blogService.updateBlog(blogUpdateRequestDto);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(error, `블로그글 수정 실패`);

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/blogs/{blogId}:
   *   delete:
   *     summary: 블로그 게시글 삭제
   *     tags:
   *       - Blogs
   *     parameters:
   *       - name: blogId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: "삭제할 블로그 게시글 ID"
   *     responses:
   *       200:
   *         description: "블로그 게시글 삭제 성공"
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BlogDeleteResponseDto'
   *       400:
   *         description: "잘못된 요청"
   *       404:
   *         description: "해당 블로그 게시글이 존재하지 않음"
   *       500:
   *         description: "서버 내부 오류"
   */
  private async deleteBlog(request: Request, response: Response) {
    try {
      const result: DefaultResponse<{
        id: number;
      }> = await this.blogService.deleteBlog(Number(request.params.blogId));

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(
          error,
          '블로그 게시글 삭제 실패'
        );

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
