import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { IdentityEntity } from './common/IdentityEntity';
import { Blog } from './Blog';
import { BlogCommentReply } from './BlogCommentReply';

/**
 * @entity BlogComment
 * 블로그 게시글에 달린 댓글 정보를 저장하는 엔티티입니다.
 * TODO 현재는 회원 테이블과 연동되지 않았으며, 추후 연동 예정입니다.
 *
 * 관계:
 * - Blog (N:1): 하나의 블로그 게시글에 여러 댓글이 달릴 수 있습니다.
 * - 댓글 삭제 시, 블로그 게시글이 삭제되면 해당 댓글도 함께 삭제됩니다 (CASCADE).
 */
@Entity('blog_comment')
export class BlogComment extends IdentityEntity {
  // todo - 회원 테이블 연동 필요

  @ManyToOne(() => Blog, (blog: Blog) => blog.comments, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'blog_id',
  })
  blog!: Blog;

  @OneToMany(
    () => BlogCommentReply,
    (blogCommentReply: BlogCommentReply) => blogCommentReply.blogComment,
    {
      cascade: true,
    }
  )
  replies?: BlogCommentReply[];

  @Column('varchar', { length: 100, nullable: false, comment: '댓글 내용' })
  content!: string;

  @Column('int', { nullable: false, comment: '작성자 회원 ID' })
  userId!: number;
}
