import { InquiryCommentReply } from '../../../../entities/InquiryCommentReply';

/**
 * @swagger
 * /api/inquiries/comments/{inquiryCommentId}/replies/{inquiryCommentReplyId}:
 *   put:
 *     summary: 특정 댓글에 대한 답글 수정
 *     description: 해당 댓글(inquiryCommentId)에 속한 답글(inquiryCommentReplyId)을 수정합니다. 비회원은 비밀번호 검증이 필요하며, 회원은 세션 쿠키 인증이 필요합니다.
 *     tags:
 *       - InquiryCommentReply (문의 댓글 답글)
 *     parameters:
 *       - name: inquiryCommentId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: 상위 댓글 ID
 *       - name: inquiryCommentReplyId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 답글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InquiryCommentReplyUpdateDto'
 *     responses:
 *       200:
 *         description: 답글 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "답글 수정 성공"
 *                 data:
 *                   type: integer
 *                   description: 수정된 답글 ID
 *                   example: 105
 *       400:
 *         description: 잘못된 요청 (유효성 검증 실패 등)
 *       404:
 *         description: 댓글 또는 답글을 찾을 수 없음
 *       500:
 *         description: 서버 내부 오류
 */
export class InquiryCommentReplyUpdateDto {
  inquiryCommentId!: number;
  inquiryCommentReplyId!: number;
  content!: string;

  constructor(data?: Partial<InquiryCommentReplyUpdateDto>) {
    if (data) {
      if (data.inquiryCommentId !== undefined) {
        this.inquiryCommentId = data.inquiryCommentId;
      }

      if (data.inquiryCommentReplyId !== undefined) {
        this.inquiryCommentReplyId = data.inquiryCommentReplyId;
      }

      if (data.content !== undefined) {
        this.content = data.content;
      }
    }
  }

  toEntity(
    inquiryCommentReply: InquiryCommentReply,
    inquiryCommentReplyUpdateDto: InquiryCommentReplyUpdateDto
  ): InquiryCommentReply {
    inquiryCommentReply.updateDateTime = new Date();
    inquiryCommentReply.content = inquiryCommentReplyUpdateDto.content;

    return inquiryCommentReply;
  }
}
