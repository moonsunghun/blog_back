import { InquiryCategory } from '../../../../types/Enum';
import { Inquiry } from '../../../entities/Inquiry';

/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryUpdateRequestDto:
 *       type: object
 *       required:
 *         - inquiryId
 *         - contentFormat
 *         - category
 *         - title
 *         - content
 *       properties:
 *         inquiryId:
 *           type: integer
 *           description: 수정할 문의 게시글 ID
 *           example: 101
 *         contentFormat:
 *           type: string
 *           description: 본문 포맷
 *           example: "HTML"
 *         category:
 *           type: string
 *           enum: [기술, 신고, 기타]
 *           description: 문의 카테고리
 *           example: "기술"
 *         title:
 *           type: string
 *           description: 문의 제목
 *           example: "에디터가 동작하지 않아요"
 *         content:
 *           type: string
 *           description: 문의 본문 내용
 *           example: "<p>Toast UI Editor 사용 중 문제가 발생합니다.</p>"
 *         deleteInquiryFileIds:
 *           type: array
 *           description: 삭제할 첨부파일 ID 목록
 *           items:
 *             type: integer
 *           example: [1, 3, 5]
 */
export class InquiryUpdateRequestDto {
  inquiryId!: number;
  contentFormat!: string;
  category!: InquiryCategory;
  title!: string;
  content!: string;
  deleteInquiryFileIds?: number[];

  constructor(data?: Partial<InquiryUpdateRequestDto>) {
    if (data) {
      if (data.inquiryId !== undefined) {
        this.inquiryId = data.inquiryId;
      }

      if (data.contentFormat !== undefined) {
        this.contentFormat = data.contentFormat;
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

      if (data.deleteInquiryFileIds !== undefined) {
        this.deleteInquiryFileIds = data.deleteInquiryFileIds;
      }
    }
  }

  toEntity(inquiryUpdateRequestDto: InquiryUpdateRequestDto) {
    const inquiry = new Inquiry();

    inquiry.updateDateTime = new Date();
    inquiry.title = inquiryUpdateRequestDto.title;
    inquiry.contentFormat = inquiryUpdateRequestDto.contentFormat;
    inquiry.category = inquiryUpdateRequestDto.category;
    inquiry.content = inquiryUpdateRequestDto.content;

    return inquiry;
  }
}
