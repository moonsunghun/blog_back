import { Inquiry } from '../../../entities/Inquiry';

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminInquiryAnswerStatusUpdateDto:
 *       type: object
 *       required:
 *         - inquiryId
 *         - answerStatus
 *       properties:
 *         inquiryId:
 *           type: integer
 *           description: "답변 상태를 수정할 문의 게시글 ID"
 *           example: 42
 *         answerStatus:
 *           type: boolean
 *           description: "답변 상태 (true: 답변 완료, false: 미답변)"
 *           example: true
 */
export class AdminInquiryAnswerStatusUpdateDto {
  inquiryId!: number;
  answerStatus!: boolean;

  constructor(data?: Partial<AdminInquiryAnswerStatusUpdateDto>) {
    if (data) {
      if (data.inquiryId !== undefined) {
        this.inquiryId = data.inquiryId;
      }

      if (data.answerStatus !== undefined) {
        this.answerStatus = data.answerStatus;
      }
    }
  }

  toEntity(adminInquiryAnswerStatusUpdateDto: AdminInquiryAnswerStatusUpdateDto) {
    const inquiry = new Inquiry();

    inquiry.updateDateTime = new Date();
    inquiry.answerStatus = adminInquiryAnswerStatusUpdateDto.answerStatus;

    return inquiry;
  }
}
