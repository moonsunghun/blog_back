import { Blog } from '../../../entities/Blog';

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogDetailResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: "블로그 ID"
 *           example: 101
 *         userId:
 *           type: integer
 *           description: "작성자(관리자) ID"
 *           example: 1
 *         title:
 *           type: string
 *           description: "블로그 제목"
 *           example: "에디터 오류 관련 문의"
 *         preview:
 *           type: string
 *           description: "프리뷰"
 *           example: "이 글은 ..."
 *         content:
 *           type: string
 *           description: "블로그 본문 내용"
 *           example: "<p>Toast UI Editor 사용 중 문제가 발생합니다.</p>"
 *         contentEnglish:
 *           type: string
 *           description: "영어 번역 내용"
 *           example: "<p>Toast UI Editor 사용 중 문제가 발생합니다.</p>"
 *         contentSummary:
 *           type: string
 *           description: "AI 요약 내용"
 *           example: "이 글은 ..."
 *         category:
 *           type: string
 *           description: "블로그 카테고리"
 *           enum: [기술, 신고, 기타]
 *           example: "기술"
 *         viewCount:
 *           type: integer
 *           description: "조회수"
 *           example: 10
 *         createDateTime:
 *           type: string
 *           format: date-time
 *           description: "입력 날짜"
 *           example: "2024-05-01T12:00:00Z"
 *         updateDateTime:
 *           type: string
 *           format: date-time
 *           description: "수정 날짜"
 *           example: "2024-05-02T12:00:00Z"
 */
export class BlogDetailResponseDto {
  id: number;
  userId: number | undefined;
  title: string;
  preview: string | null;
  content: string;
  contentEnglish: string;
  contentSummary: string | null;
  category: string;
  viewCount: number | undefined;
  createDateTime: Date | null;
  updateDateTime: Date | null;

  constructor(blog: Blog) {
    this.id = blog.id;
    this.userId = blog.userId;
    this.title = blog.title;
    this.preview = blog.preview ?? null;
    this.content = blog.content;
    this.contentEnglish = blog.contentEnglish ?? '';
    this.contentSummary = blog.contentSummary ?? null;
    this.category = blog.category ?? '';
    this.viewCount = (blog.viewCount ?? 0) as number;
    this.createDateTime = blog.createDateTime ?? null;
    this.updateDateTime = blog.updateDateTime ?? null;
  }
}
