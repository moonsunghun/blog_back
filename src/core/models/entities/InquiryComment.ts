import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { IdentityEntity } from './common/IdentityEntity';
import { Inquiry } from './Inquiry';
import { InquiryCommentReply } from './InquiryCommentReply';
import { User } from './User';

/**
 * @entity InquiryComment
 * 문의 게시글에 달린 댓글 정보를 저장하는 엔티티입니다.
 *
 * 관계:
 * - Inquiry (N:1): 하나의 문의글에 여러 댓글이 달릴 수 있습니다.
 * - 댓글 삭제 시, 문의글이 삭제되면 해당 댓글도 함께 삭제됩니다 (CASCADE).
 */
@Entity('inquiry_comment')
export class InquiryComment extends IdentityEntity {
  @ManyToOne(() => User, { nullable: true })
  user?: User | null;

  @ManyToOne(() => Inquiry, (inquiry: Inquiry) => inquiry.comments, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'inquiry_id',
  })
  inquiry!: Inquiry;

  @OneToMany(
    () => InquiryCommentReply,
    (inquiryCommentReply: InquiryCommentReply) => inquiryCommentReply.inquiryComment,
    {
      cascade: true,
    }
  )
  replies?: InquiryCommentReply[];

  @Column('varchar', { length: 50, nullable: true, comment: '비회원 작성자 별명' })
  guestNickName?: string;

  @Column('varchar', { length: 100, nullable: false, comment: '댓글 내용' })
  content!: string;
}
