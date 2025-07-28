import { DefaultResponse } from '../../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../../core/processor/CommonExceptionControllerResponseProcessor';
import { BlogCommentReplyService } from '../../../../core/api/services/blog/BlogCommentReplyService';
import { OrderBy } from '../../../../core/types/Enum';
import { Request, Response, Router } from 'express';
import {
  blogCommentReplyRegisterRequestSchema,
  blogCommentReplyParamRequestSchema,
} from '../../../../core/schemas/zod/BlogSchemas';
import { BlogCommentReplyListRequestDto } from '../../../../core/models/dtos/request/blog/reply/BlogCommentReplyListRequestDto';
import { BlogCommentReplyListResponseDto } from '../../../../core/models/dtos/response/blog/reply/BlogCommentReplyListResponseDto';
import { BlogCommentReplyCreateDto } from '../../../../core/models/dtos/request/blog/reply/BlogCommentReplyCreateDto';
import { BlogCommentReplyUpdateDto } from '../../../../core/models/dtos/request/blog/reply/BlogCommentReplyUpdateDto';
import { BlogCommentReplyDeleteRequestDto } from '../../../../core/models/dtos/request/blog/reply/BlogCommentReplyDeleteRequestDto';
import { validateRequest } from '../../../../core/middlewares/ZodValidator';
import { User } from '../../../../core/models/entities/User';
/**
 * @swagger
 * tags:
 *   name: Blogs Comments Replies
 *   description: 블로그 관련 게시글 댓글의 답글 API
 */
export class BlogCommentReplyController {
  public readonly router: Router;
  private readonly blogCommentReplyService: BlogCommentReplyService;

  constructor() {
    this.router = Router();
    this.blogCommentReplyService = new BlogCommentReplyService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      '/blogs/comments/:blogCommentId/replies',
      validateRequest({
        params: blogCommentReplyParamRequestSchema,
      }),
      this.blogCommentReplySearchListWithPaging.bind(this)
    );

    this.router.post(
      '/blogs/comments/:blogCommentId/replies',
      validateRequest({
        params: blogCommentReplyParamRequestSchema,
        body: blogCommentReplyRegisterRequestSchema,
      }),
      this.createBlogCommentReply.bind(this)
    );

    this.router.put(
      '/blogs/comments/:blogCommentId/replies/:blogCommentReplyId',
      validateRequest({
        params: blogCommentReplyParamRequestSchema,
        body: blogCommentReplyRegisterRequestSchema,
      }),
      this.blogCommentReplyUpdate.bind(this)
    );

    this.router.delete(
      '/blogs/comments/:blogCommentId/replies/:blogCommentReplyId',
      validateRequest({
        params: blogCommentReplyParamRequestSchema,
      }),
      this.blogCommentReplyDelete.bind(this)
    );
  }

  /**
   * @swagger
   * /api/blogs/comments/{blogCommentId}/replies:
   *   get:
   *     summary: 특정 댓글의 답글 목록 조회 (페이징 포함)
   *     tags:
   *       - Blogs Comments Replies
   *     parameters:
   *       - name: blogCommentId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: "답글을 조회할 댓글 ID"
   *       - name: pageNumber
   *         in: query
   *         required: false
   *         schema:
   *           type: integer
   *           default: 1
   *         description: "페이지 번호 (기본값: 1)"
   *       - name: perPageSize
   *         in: query
   *         required: false
   *         schema:
   *           type: integer
   *           default: 10
   *         description: "페이지당 항목 수 (기본값: 10)"
   *       - name: orderBy
   *         in: query
   *         required: false
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *         description: "정렬 순서 (asc: 오름차순, desc: 내림차순)"
   *     responses:
   *       200:
   *         description: "답글 목록 조회 성공"
   *         content:
   *           application/json:
   *             schema:
   *       400:
   *         description: "잘못된 요청"
   *       404:
   *         description: "해당 댓글을 찾을 수 없음"
   *       500:
   *         description: "서버 내부 오류"
   */
  private async blogCommentReplySearchListWithPaging(
    request: Request,
    response: Response
  ) {
    try {
      const blogCommentReplyListRequestDto: BlogCommentReplyListRequestDto =
        new BlogCommentReplyListRequestDto({
          blogCommentId: Number(request.params.blogCommentId),
          pageNumber: Number(request.query.pageNumber) || 1,
          perPageSize: Number(request.query.perPagesize) || 10,
          orderBy: request.query.orderBy as OrderBy,
        });

      const result: DefaultResponse<BlogCommentReplyListResponseDto> =
        await this.blogCommentReplyService.blogCommentReplySearchListWithPaging(
          blogCommentReplyListRequestDto
        );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(
          error,
          `서버 내부 오류: ${request.params.blogCommentId} 블로그 게시글의 댓글 답글 목록 조회 실패`
        );

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/blogs/comments/{blogCommentId}/replies:
   *   post:
   *     summary: 블로그 게시글에 댓글의 답글 작성
   *     description: 특정 블로그 게시글에 댓글의 답글을 작성합니다.
   *     tags:
   *       - Blogs Comments Replies
   *     parameters:
   *       - in: path
   *         name: blogCommentId
   *         required: true
   *         schema:
   *           type: integer
   *         description: 댓글의 답글을 작성할 블로그 게시글 댓글 ID
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
  private async createBlogCommentReply(request: Request, response: Response) {
    try {
      const blogCommentId: number = Number(request.params.blogCommentId);
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

      const blogCommentReplyCreateDto = new BlogCommentReplyCreateDto({
        content: request.body.content,
        userId: user?.id,
      });

      const result: DefaultResponse<number> =
        await this.blogCommentReplyService.createBlogCommentReply(
          blogCommentId,
          blogCommentReplyCreateDto
        );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(
          error,
          '서버 내부 오류: 블로그 게시글에 대한 댓글의 답글 작성 실패'
        );

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/blogs/comments/{blogCommentId}/replies/{blogCommentReplyId}:
   *   put:
   *     summary: 특정 댓글에 대한 답글 수정
   *     tags:
   *       - Blogs Comments Replies
   *     parameters:
   *       - name: blogCommentId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: "댓글 ID (답글의 상위 댓글)"
   *       - name: blogCommentReplyId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: "수정할 답글 ID"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - content
   *             properties:
   *               content:
   *                 type: string
   *                 description: "수정할 답글 내용 (5자 이상 100자 이하)"
   *                 example: "내용을 수정합니다. 감사합니다."
   *     responses:
   *       200:
   *         description: "답글 수정 성공"
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
   *                   example: "답글 수정 성공"
   *                 data:
   *                   type: integer
   *                   description: "수정된 답글 ID"
   *                   example: 105
   *       400:
   *         description: "잘못된 요청"
   *       404:
   *         description: "댓글 또는 답글을 찾을 수 없음"
   *       500:
   *         description: "서버 내부 오류"
   */
  private async blogCommentReplyUpdate(request: Request, response: Response) {
    try {
      const blogCommentReplyUpdateRequestDto = new BlogCommentReplyUpdateDto({
        blogCommentId: Number(request.params.blogCommentId),
        blogCommentReplyId: Number(request.params.blogCommentReplyId),
        content: request.body.content,
      });

      const result: DefaultResponse<number> =
        await this.blogCommentReplyService.blogCommentReplyUpdate(
          blogCommentReplyUpdateRequestDto
        );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(
          error,
          `서버 내부 오류: 답글 수정 실패`
        );

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }

  /**
   * @swagger
   * /api/blogs/comments/{blogCommentId}/replies/{blogCommentReplyId}:
   *   delete:
   *     summary: 특정 댓글에 대한 답글 삭제
   *     tags:
   *       - Blogs Comments Replies
   *     parameters:
   *       - name: blogCommentId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: "댓글 ID (답글의 상위 댓글)"
   *       - name: blogCommentReplyId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *         description: "삭제할 답글 ID"
   *     responses:
   *       200:
   *         description: "답글 삭제 성공"
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
   *                   example: "답글 삭제 성공"
   *                 data:
   *                   type: integer
   *                   description: "삭제된 답글 ID"
   *                   example: 106
   *       400:
   *         description: "잘못된 요청"
   *       404:
   *         description: "댓글 또는 답글을 찾을 수 없음"
   *       500:
   *         description: "서버 내부 오류"
   */
  private async blogCommentReplyDelete(request: Request, response: Response) {
    try {
      const blogCommentReplyDeleteRequestDto =
        new BlogCommentReplyDeleteRequestDto({
          blogCommentId: Number(request.params.blogCommentId),
          blogCommentReplyId: Number(request.params.blogCommentReplyId),
        });

      const result: DefaultResponse<number> =
        await this.blogCommentReplyService.blogCommentReplyDelete(
          blogCommentReplyDeleteRequestDto
        );

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } =
        commonExceptionControllerResponseProcessor(
          error,
          `서버 내부 오류: 답글 삭제 실패`
        );

      return response
        .status(statusCode)
        .json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
