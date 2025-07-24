import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IdentityEntity } from './common/IdentityEntity';
import { BlogComment } from './BlogComment';

/**
 * @entity BlogCommentReply
 * 블로그 게시글 댓글에 달린 답글 정보를 저장하는 엔티티입니다.
 * TODO 현재는 회원 테이블과 연동되지 않았으며, 추후 연동 예정입니다.
 *
 * 관계:
 * - BlogComment (N:1): 하나의 블로그 댓글에 여러 답글이 달릴 수 있습니다.
 * - 답글 삭제 시, 블로그 댓글이 삭제되면 해당 답글도 함께 삭제됩니다 (CASCADE).
 */
@Entity('blog_comment_reply')
export class BlogCommentReply extends IdentityEntity {
  // todo - 회원 테이블 연동 필요

  @ManyToOne(() => BlogComment, (blogComment: BlogComment) => blogComment.replies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'blog_comment_id',
  })
  blogComment!: BlogComment;

  @Column('varchar', { length: 100, nullable: false, comment: '답글 내용' })
  content!: string;

  @Column('int', { nullable: false, comment: '작성자 회원 ID' })
  userId!: number;
}
