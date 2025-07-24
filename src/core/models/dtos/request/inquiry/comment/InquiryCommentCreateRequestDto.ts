import { Request } from 'express';
import { Inquiry } from '../../../../entities/Inquiry';
import { InquiryComment } from '../../../../entities/InquiryComment';
import { User } from '../../../../entities/User';
import { generatedGuestNickNameUuid } from '../../../../../utilities/Generater';

/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryCommentCreateRequestDto:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: 댓글 내용
 *           example: "이 서비스 정말 좋네요!"
 *         guestNickName:
 *           type: string
 *           description: 비회원 닉네임 (회원일 경우 무시됨, 서버에서 UUID 앞 4자리 자동 생성)
 *           example: "a1b2"
 *         guestPassword:
 *           type: string
 *           description: 비회원 비밀번호 (회원일 경우 생략)
 *           example: "1234"
 */
export class InquiryCommentCreateRequestDto {
  userRequest!: Request;
  guestNickName?: string;
  content!: string;

  constructor(data?: Partial<InquiryCommentCreateRequestDto>) {
    if (data) {
      this.userRequest = data.userRequest!;

      if (data.content !== undefined) {
        this.content = data.content;
      }
    }
  }

  toEntity(
    user: User | null,
    inquiry: Inquiry,
    inquiryCommentRegisterDto: InquiryCommentCreateRequestDto
  ) {
    const inquiryComment = new InquiryComment();
    inquiryComment.inquiry = inquiry;

    inquiryComment.user = user;
    inquiryComment.createDateTime = new Date();
    inquiryComment.guestNickName =
      user === null
        ? (inquiryCommentRegisterDto.guestNickName ?? generatedGuestNickNameUuid())
        : undefined;
    inquiryComment.content = inquiryCommentRegisterDto.content;

    return inquiryComment;
  }
}
