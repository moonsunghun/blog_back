import { Request } from 'express';
import { InquiryComment } from '../../../../entities/InquiryComment';
import { InquiryCommentReply } from '../../../../entities/InquiryCommentReply';
import { User } from '../../../../entities/User';
import { generatedGuestNickNameUuid } from '../../../../../utilities/Generater';

/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryCommentReplyCreateDto:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: 답글 내용
 *           example: "이 문의에 대해 궁금한 점이 있습니다."
 *         guestNickName:
 *           type: string
 *           description: 비회원 작성자 닉네임 (회원일 경우 생략)
 *           example: "비회원123"
 *         guestPassword:
 *           type: string
 *           description: 비회원 비밀번호 (회원일 경우 생략 - 수정/삭제 시 필요)
 *           example: "securePw123!"
 */
export class InquiryCommentReplyCreateDto {
  userRequest!: Request;
  guestNickName?: string;
  content!: string;

  constructor(data?: Partial<InquiryCommentReplyCreateDto>) {
    if (data) {
      this.userRequest = data.userRequest!;

      if (data.content !== undefined) {
        this.content = data.content;
      }
    }
  }

  toEntity(
    user: User | null,
    inquiryComment: InquiryComment,
    inquiryCommentReplyCreateRequestDto: InquiryCommentReplyCreateDto
  ) {
    const inquiryCommentReply = new InquiryCommentReply();
    inquiryCommentReply.inquiryComment = inquiryComment;

    inquiryCommentReply.user = user;
    inquiryCommentReply.createDateTime = new Date();
    inquiryCommentReply.guestNickName =
      user === null
        ? (inquiryCommentReplyCreateRequestDto.guestNickName ?? generatedGuestNickNameUuid())
        : undefined;
    inquiryCommentReply.content = inquiryCommentReplyCreateRequestDto.content;

    return inquiryCommentReply;
  }
}
