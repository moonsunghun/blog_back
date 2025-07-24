import { Inquiry } from '../../../entities/Inquiry';
import { findInquiryWriter } from '../../../../utilities/Finder';

/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryListResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 문의 게시글 고유 ID
 *           example: 101
 *         title:
 *           type: string
 *           description: 문의 제목
 *           example: "로그인 후 에디터가 동작하지 않습니다"
 *         writer:
 *           type: string
 *           description: 작성자 (회원 이메일 또는 비회원 닉네임)
 *           example: "익명1234"
 *         createDateTime:
 *           type: string
 *           format: date-time
 *           description: 문의 생성 일시 (ISO 8601 형식)
 *           example: "2025-07-13T17:24:00.000Z"
 *         answerStatus:
 *           type: boolean
 *           description: 답변 완료 여부
 *           example: false
 */
export class InquiryListResponseDto {
  readonly id!: number;
  readonly title!: string;
  readonly writer!: string;
  readonly createDateTime!: Date;
  readonly answerStatus!: boolean;

  constructor(inquiry: Inquiry) {
    this.id = inquiry.id;
    this.title = inquiry.title;
    this.writer = findInquiryWriter(inquiry);
    this.createDateTime = inquiry.createDateTime;
    this.answerStatus = inquiry.answerStatus;
  }
}
