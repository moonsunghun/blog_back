import { InquirySearchOrderColumn } from '../../../../types/Enum';
import { PageRequestDto } from '../PageRequestDto';

/**
 * @swagger
 * components:
 *   schemas:
 *     InquirySearchRequestDto:
 *       type: object
 *       properties:
 *         pageNumber:
 *           type: integer
 *           description: "페이지 번호 (기본값: 1)"
 *           example: 1
 *         perPageSize:
 *           type: integer
 *           description: "페이지당 항목 수 (기본값: 10)"
 *           example: 10
 *         orderBy:
 *           type: string
 *           description: "정렬 방향 (asc | desc)"
 *           enum: [asc, desc]
 *           example: "desc"
 *         orderColumn:
 *           type: string
 *           description: "정렬 기준 컬럼명"
 *           enum: [createDateTime, updateDateTime, deleteDateTime title, guestNickName]
 *           example: "createDateTime"
 *         title:
 *           type: string
 *           description: "문의 제목 검색어"
 *           example: "에디터 오류"
 *         writer:
 *           type: string
 *           description: "작성자 검색어 (닉네임)"
 *           example: "비회원123"
 *         answerStatus:
 *           type: boolean
 *           description: "답변 여부 (true: 완료, false: 미완료)"
 *           example: true
 *         content:
 *           type: string
 *           description: "본문 내용 검색어"
 *           example: "에디터가 저장되지 않음"
 */
export class InquirySearchRequestDto extends PageRequestDto {
  orderColumn?: InquirySearchOrderColumn;

  title?: string;

  writer?: string;

  answerStatus?: boolean;

  content?: string;

  constructor(data?: Partial<InquirySearchRequestDto>) {
    super(data);

    if (data) {
      if (data.title !== undefined) {
        this.title = data.title;
      }

      if (data.writer !== undefined) {
        this.writer = data.writer;
      }

      if (data.answerStatus !== undefined) {
        this.answerStatus = data.answerStatus;
      }

      if (data.content !== undefined) {
        this.content = data.content;
      }

      if (data.orderColumn !== undefined) {
        this.orderColumn = data.orderColumn;
      } else {
        this.orderColumn = 'createDateTime';
      }
    }
  }
}
