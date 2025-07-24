import { PageRequestDto } from '../../PageRequestDto';

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogCommentListRequestDto:
 *       type: object
 *       required:
 *         - blogId
 *       properties:
 *         blogId:
 *           type: integer
 *           description: "댓글을 조회할 블로그 게시글 ID"
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
export class BlogCommentListRequestDto extends PageRequestDto {
  blogId!: number;

  constructor(data?: Partial<BlogCommentListRequestDto>) {
    super(data);

    if (data) {
      if (data.blogId !== undefined) {
        this.blogId = data.blogId;
      }
    }
  }
}
