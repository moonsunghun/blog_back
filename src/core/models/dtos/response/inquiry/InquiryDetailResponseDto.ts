import { InquiryCategory } from '../../../../types/Enum';
import { Inquiry } from '../../../entities/Inquiry';
import { ApplicationFile } from '../../../entities/common/ApplicationFile';
import { InquiryComment } from '../../../entities/InquiryComment';
import { InquiryCommentReply } from '../../../entities/InquiryCommentReply';
import { FileResponseDto } from '../FileResponseDto';
import { InquiryCommentListResponseDto } from './comment/InquiryCommentListResponseDto';
import { InquiryCommentReplyListResponseDto } from './reply/InquiryCommentReplyListResponseDto';
import { findInquiryWriter } from '../../../../utilities/Finder';

/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryDetailResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 문의 게시글 ID
 *           example: 1
 *         writer:
 *           type: string
 *           description: 작성자 닉네임 (회원일 경우 닉네임, 비회원일 경우 UUID 앞 4자리)
 *           example: "abcd"
 *         createDateTime:
 *           type: string
 *           format: date-time
 *           description: 게시글 생성 시각 (ISO 8601 형식)
 *           example: "2025-07-13T15:00:00.000Z"
 *         updateDateTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 게시글 최종 수정 시각 (수정 이력이 없을 경우 null)
 *           example: "2025-07-13T17:10:00.000Z"
 *         title:
 *           type: string
 *           description: 문의 제목
 *           example: "서비스 오류 관련 문의드립니다."
 *         contentFormat:
 *           type: string
 *           description: 본문 포맷 (예 HTML Markdown)
 *           example: "HTML"
 *         category:
 *           type: string
 *           enum: [기술, 신고, 기타]
 *           description: 문의 카테고리
 *           example: "기술"
 *         answerStatus:
 *           type: boolean
 *           description: 답변 완료 여부 (true 답변 완료, false 미답변)
 *           example: false
 *         content:
 *           type: string
 *           description: 문의 본문 내용 (포맷에 따라 HTML 또는 Markdown)
 *           example: "<p>로그인 시 오류가 발생합니다.</p>"
 *         files:
 *           type: array
 *           description: 첨부된 파일 목록
 *           items:
 *             $ref: '#/components/schemas/FileResponseDto'
 *         comments:
 *           type: array
 *           description: 해당 게시글에 작성된 댓글 목록
 *           items:
 *             $ref: '#/components/schemas/InquiryCommentListResponseDto'
 *         replies:
 *           type: array
 *           description: 댓글에 작성된 모든 답글 목록
 *           items:
 *             $ref: '#/components/schemas/InquiryCommentReplyListResponseDto'
 */
export class InquiryDetailResponseDto {
  readonly id!: number;
  readonly writer!: string;
  readonly createDateTime!: Date;
  readonly updateDateTime?: Date;
  readonly title!: string;
  readonly contentFormat!: string;
  readonly category!: InquiryCategory;
  readonly answerStatus!: boolean;
  readonly content!: string;
  readonly files?: FileResponseDto[];
  readonly comments?: InquiryCommentListResponseDto[];
  readonly replies?: InquiryCommentReplyListResponseDto[];

  constructor(inquiry: Inquiry, inquiryFiles?: ApplicationFile[]) {
    this.id = inquiry.id;
    this.writer = findInquiryWriter(inquiry);
    this.createDateTime = inquiry.createDateTime;
    this.updateDateTime = inquiry.updateDateTime;
    this.title = inquiry.title;
    this.contentFormat = inquiry.contentFormat!;
    this.category = inquiry.category;
    this.answerStatus = inquiry.answerStatus;
    this.content = inquiry.content;

    this.files = Array.isArray(inquiryFiles)
      ? inquiryFiles.map((file: ApplicationFile) => new FileResponseDto(file.id, file.path))
      : [];

    this.comments = Array.isArray(inquiry.comments)
      ? inquiry.comments.map(
          (inquiryComment: InquiryComment) => new InquiryCommentListResponseDto(inquiryComment)
        )
      : [];

    this.replies = Array.isArray(inquiry.comments)
      ? inquiry.comments.flatMap((inquiryComment: InquiryComment) =>
          Array.isArray(inquiryComment.replies)
            ? inquiryComment.replies.map(
                (inquiryCommentReply: InquiryCommentReply) =>
                  new InquiryCommentReplyListResponseDto(inquiryCommentReply)
              )
            : []
        )
      : [];
  }
}
