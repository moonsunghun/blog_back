import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IdentityEntity } from './common/IdentityEntity';
import { InquiryComment } from './InquiryComment';
import { User } from './User';

/**
 * @entity InquiryCommentReply
 * 문의 게시글 댓글에 달린 답글 정보를 저장하는 엔티티입니다.
 *
 * 관계:
 * - Inquiry (N:1): 하나의 문의글 댓글에 여러 답글이 달릴 수 있습니다.
 * - 답글 삭제 시, 문의글의 댓글이 삭제되면 해당 답글도 함께 삭제됩니다 (CASCADE).
 */
@Entity('inquiry_comment_reply')
export class InquiryCommentReply extends IdentityEntity {
  @ManyToOne(() => User, { nullable: true })
  user?: User | null;

  @ManyToOne(() => InquiryComment, (inquiryComment: InquiryComment) => inquiryComment.replies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'inquiry_comment_id',
  })
  inquiryComment!: InquiryComment;

  @Column('varchar', { length: 50, nullable: true, comment: '비회원 작성자 별명' })
  guestNickName?: string;

  @Column('varchar', { length: 100, nullable: false, comment: '답글 내용' })
  content!: string;
}
