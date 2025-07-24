import { Request, Response, Router } from 'express';
import { DefaultResponse } from '../../../core/constant/DefaultResponse';
import { commonExceptionControllerResponseProcessor } from '../../../core/processor/CommonExceptionControllerResponseProcessor';
import { UserService } from '../../../core/api/services/user/UserService';
import { validateRequest } from '../../../core/middlewares/ZodValidator';
import { userListSearchSchema } from '../../../core/schemas/zod/UserSchemas';
import { OrderBy } from '../../../core/types/Enum';

import { UserSearchRequestDto } from '../../../core/models/dtos/request/user/UserSearchRequestDto';
import { UserListResponseDto } from '../../../core/models/dtos/response/user/UserListResponseDto';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 회원 관리 API
 */
export class UserController {
  public readonly router: Router;
  private readonly userService: UserService;

  constructor() {
    this.router = Router();
    this.userService = new UserService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      '/users',
      validateRequest({
        query: userListSearchSchema,
      }),
      this.getUserListWithSearch.bind(this)
    );
  }

  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: 회원 목록 조회 (검색, 정렬, 페이징 포함)
   *     tags:
   *       - Users
   *     parameters:
   *       - name: pageNumber
   *         in: query
   *         required: false
   *         schema:
   *           type: integer
   *           default: 1
   *         description: "페이지 번호"
   *       - name: perPageSize
   *         in: query
   *         required: false
   *         schema:
   *           type: integer
   *           default: 10
   *         description: "페이지당 항목 수"
   *       - name: email
   *         in: query
   *         required: false
   *         schema:
   *           type: string
   *         description: "이메일 검색어"
   *       - name: nickName
   *         in: query
   *         required: false
   *         schema:
   *           type: string
   *         description: "닉네임 검색어"
   *       - name: blockState
   *         in: query
   *         required: false
   *         schema:
   *           type: boolean
   *         description: "차단 여부 (true: 차단, false: 미차단)"
   *     responses:
   *       200:
   *         description: "회원 목록 조회 성공"
   *         content:
   *           application/json:
   *             schema:
   *       500:
   *         description: "서버 내부 오류"
   */
  private async getUserListWithSearch(request: Request, response: Response) {
    try {
      const userSearchRequestDto = new UserSearchRequestDto({
        pageNumber: Number(request.query.pageNumber) || 1,
        perPageSize: Number(request.query.perPageSize) || 10,
        orderBy: request.query.orderBy as OrderBy,
        email: request.query.email as string,
        nickName: request.query.nickName as string,
        blockState: request.query.blockState === 'false',
      });

      const result: DefaultResponse<UserListResponseDto> =
        await this.userService.getUserListWithSearch(userSearchRequestDto);

      return response.status(result.statusCode).json(result);
    } catch (error: any) {
      const { statusCode, errorMessage } = commonExceptionControllerResponseProcessor(
        error,
        '회원 목록 조회 실패'
      );

      return response.status(statusCode).json(DefaultResponse.response(statusCode, errorMessage));
    }
  }
}
