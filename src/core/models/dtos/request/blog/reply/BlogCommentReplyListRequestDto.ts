import { DefaultSearchOrderColumn } from '../../../../../types/Enum';
import { PageRequestDto } from '../../PageRequestDto';

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogCommentReplyListRequestDto:
 *       type: object
 *       required:
 *         - blogCommentId
 *       properties:
 *         orderColumn:
 *           type: string
 *           example: "createDateTime"
 *           description: 정렬 기준
 *         blogCommentId:
 *           type: integer
 *           description: "댓글의 답글을 조회할 블로그 게시글 댓글 ID"
 *           example: 42
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
 *           description: "정렬 기준 (asc: 오름차순, desc: 내림차순)"
 *           enum: [asc, desc]
 *           example: desc
 */
export class BlogCommentReplyListRequestDto extends PageRequestDto {
  orderColumn?: DefaultSearchOrderColumn;
  blogCommentId!: number;

  constructor(data?: Partial<BlogCommentReplyListRequestDto>) {
    super(data);

    if (data) {
      if (data.blogCommentId !== undefined) {
        this.blogCommentId = data.blogCommentId;
      }
    }
  }
}
