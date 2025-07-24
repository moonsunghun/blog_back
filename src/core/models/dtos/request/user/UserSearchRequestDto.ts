import { PageRequestDto } from '../PageRequestDto';

/**
 * @swagger
 * components:
 *   schemas:
 *     UserSearchRequestDto:
 *       type: object
 *       properties:
 *         pageNumber:
 *           type: integer
 *           description: "페이지 번호 (기본값: 1)"
 *           example: 1
 *         perPageSize:
 *           type: integer
 *           description: "페이지당 항목 수 (기본값: 10)"
 *           example: 10
 *         orderBy:
 *           type: string
 *           description: "정렬 방향 (asc | desc)"
 *           enum: [asc, desc]
 *           example: "desc"
 *         orderColumn:
 *           type: string
 *           description: "정렬 기준 컬럼명"
 *           enum: [createDateTime, updateDateTime, deleteDateTime title, guestNickName]
 *           example: "createDateTime"
 *         email:
 *           type: string
 *           description: "이메일 검색어"
 *           example: "test@test.com"
 *         nickName:
 *           type: string
 *           description: "닉네임 검색어"
 *           example: "비회원123"
 *         blockState:
 *           type: boolean
 *           description: "차단 여부 (true: 차단, false: 미차단)"
 *           example: true
 */
export class UserSearchRequestDto extends PageRequestDto {
  email?: string;

  nickName?: string;

  blockState?: boolean;

  constructor(data?: Partial<UserSearchRequestDto>) {
    super(data);

    if (data) {
      if (data.email !== undefined) {
        this.email = data.email;
      }

      if (data.nickName !== undefined) {
        this.nickName = data.nickName;
      }

      if (data.blockState !== undefined) {
        this.blockState = data.blockState;
      }
    }
  }
}
