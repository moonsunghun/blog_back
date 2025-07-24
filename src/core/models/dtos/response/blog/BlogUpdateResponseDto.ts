 
/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryUpdateResponseDto:
 *       type: object
 *       properties:
 *         inquiryId:
 *           type: integer
 *           description: "수정된 문의글 ID"
 *           example: 1 
 */
export class BlogUpdateResponseDto {
  readonly blogId!: number; 

  constructor(blogId: number) {
    this.blogId = blogId; 
  }
}
