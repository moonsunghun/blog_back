import { Request } from 'express';
import bcrypt from 'bcrypt';
import { InquiryCategory } from '../../../../types/Enum';
import { Inquiry } from '../../../entities/Inquiry';
import { User } from '../../../entities/User';
import { generatedGuestNickNameUuid } from '../../../../utilities/Generater';

/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryCreateRequestDto:
 *       type: object
 *       required:
 *         - contentFormat
 *         - category
 *         - title
 *         - content
 *       properties:
 *         guestNickName:
 *           type: string
 *           description: 비회원 닉네임 (회원은 자동 지정되므로 생략 가능)
 *           example: "a1b2"
 *         guestPassword:
 *           type: string
 *           description: 비회원 비밀번호 (회원은 생략)
 *           example: "1234"
 *         contentFormat:
 *           type: string
 *           description: 콘텐츠 포맷 (HTML or Markdown)
 *           example: "HTML"
 *         category:
 *           type: string
 *           enum: [기술, 신고, 기타]
 *           description: 문의 카테고리
 *           example: "기술"
 *         title:
 *           type: string
 *           description: 문의 제목
 *           example: "에디터 오류가 발생합니다"
 *         content:
 *           type: string
 *           description: 문의 본문 내용
 *           example: "<p>에디터가 저장되지 않습니다.</p>"
 */
export class InquiryCreateRequestDto {
  userRequest!: Request;
  guestNickName?: string;
  guestPassword?: string;
  contentFormat!: string;
  category!: InquiryCategory;
  title!: string;
  content!: string;

  constructor(data?: Partial<InquiryCreateRequestDto>) {
    if (data) {
      this.userRequest = data.userRequest!;

      if (data.guestPassword !== undefined) {
        this.guestPassword = bcrypt.hashSync(data.guestPassword, 10);
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
    }
  }

  toEntity(user: User | null, inquiryCreatedRequestDto: InquiryCreateRequestDto) {
    const inquiry = new Inquiry();

    inquiry.user = user;
    inquiry.createDateTime = new Date();
    inquiry.guestNickName =
      user === null
        ? (inquiryCreatedRequestDto.guestNickName ?? generatedGuestNickNameUuid())
        : undefined;
    inquiry.guestPassword = inquiryCreatedRequestDto.guestPassword;
    inquiry.title = inquiryCreatedRequestDto.title;
    inquiry.contentFormat = inquiryCreatedRequestDto.contentFormat;
    inquiry.category = inquiryCreatedRequestDto.category;
    inquiry.answerStatus = false;
    inquiry.content = inquiryCreatedRequestDto.content;

    return inquiry;
  }
}
