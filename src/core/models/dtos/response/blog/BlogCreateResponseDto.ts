 
/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryCreateResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         files:
 *           type: array
 *           description: "List of uploaded file(s)"
 *           items:
 *             $ref: '#/components/schemas/InquiryFileSummaryDto'
 */
export class BlogCreateResponseDto { 
  blogId: number;

  constructor(blogId: number) {
    this.blogId = blogId;
  }
}
