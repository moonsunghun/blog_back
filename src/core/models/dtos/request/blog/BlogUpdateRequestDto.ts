 
import { Blog } from '../../../entities/Blog';

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogUpdateRequestDto:
 *       type: object
 *       required:
 *         - blogId
 *         - title
 *         - content
 *         - contentSummary
 *         - category
 *       properties:
 *         blogId:
 *           type: integer
 *           description: "수정할 블로그 게시글 ID"
 *           example: 101
 *         title:
 *           type: string
 *           description: "블로그 제목"
 *           example: "블로그 제목"
 *         preview:
 *           type: string
 *           description: "블로그 미리보기"
 *           example: "블로그 미리보기"
 *         content:
 *           type: string
 *           description: "블로그 본문 내용"
 *           example: "<p>Toast UI Editor 사용 중 문제가 발생합니다.</p>"
 *         contentSummary:
 *           type: string
 *           description: "블로그 요약"
 *           example: "블로그 요약"
 *         category:
 *           type: string
 *           description: "블로그 카테고리"
 *           example: "블로그 카테고리"
 */
export class BlogUpdateRequestDto {
  blogId!: number;

  preview!: string;

  title!: string;

  content!: string;

  category!: string;

  contentSummary!: string;

  constructor(data?: Partial<BlogUpdateRequestDto>) {
    if (data) {
      if (data.blogId !== undefined) {
        this.blogId = data.blogId;
      }

      if (data.preview !== undefined) {
        this.preview = data.preview;
      }

      if (data.category !== undefined) {
        this.category = data.category;
      }

      if (data.title !== undefined) {
        this.title = data.title;
      }

      if (data.content !== undefined) {
        this.content = data.content;
      } 

      if (data.contentSummary !== undefined) {
        this.contentSummary = data.contentSummary;
      }
    }
  }

  toEntity(blogUpdateRequestDto: BlogUpdateRequestDto) {
    const  blog = new Blog();

    
    blog.title = blogUpdateRequestDto.title;
    blog.preview = blogUpdateRequestDto.preview;
    blog.category = blogUpdateRequestDto.category;
    blog.content = blogUpdateRequestDto.content;
    blog.contentSummary = blogUpdateRequestDto.contentSummary;

    return blog;
  }
}
