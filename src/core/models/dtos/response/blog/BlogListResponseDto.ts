import { Blog } from '../../../entities/Blog';

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogListResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *           description: 블로그 고유 ID
 *         title:
 *           type: string
 *           example: "React 18의 새로운 기능과 Concurrent Features 완벽 가이드"
 *           description: 블로그 제목
 *         writer:
 *           type: string
 *           example: "관리자"
 *           description: 작성자 닉네임
 *         preview:
 *           type: string
 *           example: "React 18 주요 기능 요약"
 *           description: 블로그 프리뷰
 *         category:
 *           type: string
 *           example: "프론트엔드"
 *           description: 카테고리
 *         viewCount:
 *           type: integer
 *           example: 100
 *           description: 조회수
 *         createDateTime:
 *           type: string
 *           format: date-time
 *           example: "2025-06-29T15:00:00.000Z"
 *           description: 게시글 생성일시
 */
export class BlogListResponseDto {
  public id: number;
  public title: string;
  public writer: string;
  public preview?: string;
  public category?: string;
  public viewCount: number;
  public content: string;
  public createDateTime: Date;

  constructor(blog: Blog) {
    this.id = blog.id;
    this.title = blog.title ?? '';
    // TODO: 작성자 닉네임 로직 구현 필요 (user_id → 닉네임 변환 등)
    this.writer = '관리자';
    this.preview = blog.preview;
    this.category = blog.category;
    this.viewCount = blog.viewCount ?? 0;
    this.createDateTime = blog.createDateTime;
    this.content = blog.content ?? '';
  }
}
