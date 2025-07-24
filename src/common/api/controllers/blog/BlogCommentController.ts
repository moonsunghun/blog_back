import { Request, Response, Router } from 'express';
import { DefaultResponse } from '../../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../../core/processor/CommonExceptionControllerResponseProcessor';
import { OrderBy } from '../../../../core/types/Enum';
import { validateRequest } from '../../../../core/middlewares/ZodValidator';
import { pageRequestSchema } from '../../../../core/schemas/zod/PageRequestSchma';
import { BlogCommentListRequestDto } from '../../../../core/models/dtos/request/blog/comment/BlogCommentListRequestDto';
import { BlogCommentListResponseDto } from '../../../../core/models/dtos/response/blog/comment/BlogCommentListResponseDto';
import {
  blogCommentParamRequestSchema,
  blogCommentRegisterRequestSchema,
  blogCommentSchema,
  blogIdSchema,
} from '../../../../core/schemas/zod/BlogSchemas';
import { BlogCommentService } from '../../../../core/api/services/blog/BlogCommentService';
import { BlogCommentCreateRequestDto } from '../../../../core/models/dtos/request/blog/comment/BlogCommentCreateRequestDto';
import { BlogCommentUpdateRequestDto } from '../../../../core/models/dtos/request/blog/comment/BlogCommentUpdateRequestDto';
import { BlogCommentDeleteRequestDto } from '../../../../core/models/dtos/request/blog/comment/BlogCommentDeleteRuquestDto';
import { User } from '../../../../core/models/entities/User';
import { findBySessionUserId } from '../../../../core/utilities/Finder';
/**
 * @swagger
 * tags:
 *   name: Blogs Comments
 *   description: 블로그 관련 게시글 댓글 API
 */
export class BlogCommentController {
  public readonly router: Router;
  private readonly blogCommentService: BlogCommentService;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
    this.blogCommentService = new BlogCommentService();
  }

  private initializeRoutes() {
    this.router.post(
      '/blogs/:blogId/comments',
      validateRequest({
        params: blogIdSchema,
        body: blogCommentSchema,
      }),
      this.createdBlogComment.bind(this)
    );

    this.router.get(
      '/blogs/:blogId/comments',
      validateRequest({
        params: blogIdSchema,
        query: pageRequestSchema,
      }),
      this.blogCommentSearchListWithPaging.bind(this)
    );

    this.router.put(
      '/blogs/:blogId/comments/:blogCommentId',
      validateRequest({
        params: blogCommentParamRequestSchema,
        body: blogCommentRegisterRequestSchema,
      }),
      this.blogCommentUpdate.bind(this)
    );

    this.router.delete(
      '/blogs/:blogId/comments/:blogCommentId',
      validateRequest({
        params: blogCommentParamRequestSchema,
      }),
      this.deletedBlogComment.bind(this)
    );
  }

  /**
   * @swagger
   * /api/blogs/{blogId}/comments:
   *   post:
   *     summary: 블로그 게시글에 댓글 작성
   *     description: 특정 블로그 게시글에 댓글을 작성합니다.
   *     tags:
   *       - Blogs Comments
   *     parameters:
   *       - in: path
   *         name: blogId
   *         required: true
   *         schema:
   *           type: integer
   *         description: 댓글을 작성할 블로그 게시글 ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               content:
   *                 type: string
   *                 example: 이 글에 대해 궁금한 점이 있어요!
   *                 description: 댓글 내용
   *               userId:
   *                 type: integer
   *                 example: 1
   *                 description: 댓글 작성자 ID
   *     responses:
   *       201:
   *         description: 댓글 작성 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DefaultResponse'
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
   *               $ref: '#/components/schemas/DefaultResponse'
   */
  private async createdBlogComment(request: Request, response: Response) {
    try {
      const blogId: number = Number(request.params.blogId);

      const user: User | null = await findBySessionUserId(request);

      const blogCommentRegisterDto = new BlogCommentCreateRequestDto({
        content: request.body.content,
        userId: user?.id,
      });

      const result: DefaultResponse<number> = await this.blogCommentService.createBlogComment(
        blogId,
        blogCommentRegisterDto
      );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        '블로그 게시글에 대한 댓글 작성 실패'
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/blogs/{blogId}/comments:
   *   get:
   *     summary: 특정 블로그 게시글의 댓글 목록 조회
   *     tags:
   *       - Blogs Comments
   *     parameters:
   *       - name: blogId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: "조회할 블로그 게시글 ID"
   *       - name: pageNumber
   *         in: query
   *         required: false
   *         schema:
   *           type: integer
   *           default: 1
   *         description: "페이지 번호 (기본값: 1)"
   *       - name: perPagesize
   *         in: query
   *         required: false
   *         schema:
   *           type: integer
   *           default: 10
   *         description: "페이지당 댓글 수 (기본값: 10)"
   *       - name: orderBy
   *         in: query
   *         required: false
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *         description: "정렬 기준 (오름차순: asc, 내림차순: desc)"
   *     responses:
   *       200:
   *         description: "댓글 목록 조회 성공"
   *         content:
   *           application/json:
   *             schema:
   *       400:
   *         description: "잘못된 요청"
   *       500:
   *         description: "서버 내부 오류"
   */
  private async blogCommentSearchListWithPaging(request: Request, response: Response) {
    try {
      const blogCommentListRequestDto: BlogCommentListRequestDto = new BlogCommentListRequestDto({
        blogId: Number(request.params.blogId),
        pageNumber: Number(request.query.pageNumber) || 1,
        perPageSize: Number(request.query.perPagesize) || 10,
        orderBy: request.query.orderBy as OrderBy,
      });

      const result: DefaultResponse<BlogCommentListResponseDto> =
        await this.blogCommentService.blogCommentSearchListWithPaging(blogCommentListRequestDto);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `${request.params.blogId} 블로그 게시글의 댓글 목록 조회 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/blogs/{blogId}/comments/{blogCommentId}:
   *   put:
   *     summary: 특정 블로그 게시글의 댓글 수정
   *     tags:
   *       - Blogs Comments
   *     parameters:
   *       - name: blogId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: "댓글이 속한 블로그 게시글 ID"
   *       - name: blogCommentId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: "수정할 댓글 ID"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               content:
   *                 type: string
   *                 description: "수정할 댓글 내용 (5자 이상 100자 이하)"
   *                 example: "수정된 댓글 내용입니다."
   *     responses:
   *       200:
   *         description: "댓글 수정 성공"
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
   *                   example: "댓글 수정 성공"
   *                 data:
   *                   type: integer
   *                   description: "수정된 댓글 ID"
   *                   example: 23
   *       400:
   *         description: "잘못된 요청"
   *       404:
   *         description: "댓글 또는 문의글을 찾을 수 없음"
   *       500:
   *         description: "서버 내부 오류"
   */
  private async blogCommentUpdate(request: Request, response: Response) {
    try {
      const blogCommentUpdateRequestDto = new BlogCommentUpdateRequestDto({
        blogId: Number(request.params.blogId),
        blogCommentId: Number(request.params.blogCommentId),
        content: request.body.content,
      });

      const result: DefaultResponse<number> = await this.blogCommentService.blogCommentUpdate(
        blogCommentUpdateRequestDto
      );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `댓글 수정 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/blogs/{blogId}/comments/{blogCommentId}:
   *   delete:
   *     summary: 특정 블로그 게시글의 댓글 삭제
   *     tags:
   *       - Blogs Comments
   *     parameters:
   *       - name: blogId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: "댓글이 속한 블로그 게시글 ID"
   *       - name: blogCommentId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: "삭제할 댓글 ID"
   *     responses:
   *       200:
   *         description: "댓글 삭제 성공"
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
   *                   example: "댓글 삭제 성공"
   *                 data:
   *                   type: integer
   *                   description: "삭제된 댓글 ID"
   *                   example: 37
   *       400:
   *         description: "잘못된 요청"
   *       404:
   *         description: "댓글 또는 문의글을 찾을 수 없음"
   *       500:
   *         description: "서버 내부 오류"
   */
  private async deletedBlogComment(request: Request, response: Response) {
    try {
      const blogCommentDeleteRequestDto = new BlogCommentDeleteRequestDto({
        blogId: Number(request.params.blogId),
        blogCommentId: Number(request.params.blogCommentId),
      });

      const result: DefaultResponse<number> = await this.blogCommentService.deletedBlogComment(
        blogCommentDeleteRequestDto
      );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        `댓글 삭제 실패`
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
