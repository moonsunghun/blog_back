/**
 * @swagger
 * components:
 *   schemas:
 *     BlogDatailSearchRequestDto:
 *       type: object
 *       required:
 *         - blogId
 *       properties:
 *         blogId:
 *           type: integer
 *           description: "조회할 블로그 게시글 ID"
 *           example: 42
 *         processType:
 *           type: boolean
 *           description: "댓글 및 답글까지 포함해서 조회할지 여부 (기본값: false)"
 *           example: true
 */
export class BlogDetailSearchRequestDto {
  blogId!: number;
  processType?: boolean = false;

  constructor(data?: { blogId?: number; processType?: any }) {
      if (data) {
          if (data.blogId !== undefined) {
              this.blogId = Number(data.blogId);
          }

          if (data.processType !== undefined) {
              this.processType =
                  typeof data.processType === 'string'
                      ? data.processType === 'true'
                      : Boolean(data.processType);
          }
      }
  }
}
