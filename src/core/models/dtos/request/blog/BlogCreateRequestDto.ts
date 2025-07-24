import { Blog } from '../../../entities/Blog';

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogCreateRequestDto:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: 'Next.js 14 신규 기능 정리'
 *         preview:
 *           type: string
 *           example: '이 글은 Next.js 14의 주요 기능을 정리합니다.'
 *         content:
 *           type: string
 *           example: '<p>Next.js 14에서는 ...</p>'
 *         contentSummary:
 *           type: string
 *           example: '이 글은 ...'
 *         category:
 *           type: string
 *           example: '기술'
 *         contentEnglish:
 *           type: string
 *           example: '<p>This article explains ...</p>'
 */
export class BlogCreateRequestDto {
  userId: number;
  title!: string;
  preview: string;
  content!: string;
  contentSummary: string;
  category!: string;
  contentEnglish?: string;

  constructor(data?: Partial<BlogCreateRequestDto>) {
    if (data) {
      if (data.userId !== undefined) this.userId = data.userId;
      if (data.title !== undefined) this.title = data.title;
      if (data.preview !== undefined) this.preview = data.preview;
      if (data.content !== undefined) this.content = data.content;
      if (data.contentSummary !== undefined) this.contentSummary = data.contentSummary;
      if (data.category !== undefined) this.category = data.category;
      if (data.contentEnglish !== undefined) this.contentEnglish = data.contentEnglish;
    }
  }

  toEntity(blogCreateRequestDto: BlogCreateRequestDto) {
    const blog = new Blog();
    if (blogCreateRequestDto.userId !== undefined) blog.userId = blogCreateRequestDto.userId;
    blog.title = blogCreateRequestDto.title;
    blog.preview = blogCreateRequestDto.preview;
    blog.content = blogCreateRequestDto.content;
    blog.contentSummary = blogCreateRequestDto.contentSummary;
    blog.category = blogCreateRequestDto.category;
    blog.viewCount = 0;
    if (blogCreateRequestDto.contentEnglish !== undefined)
      blog.contentEnglish = blogCreateRequestDto.contentEnglish;
    return blog;
  }
}
