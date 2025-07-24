import { Entity, Column, OneToMany } from 'typeorm';
import { IdentityEntity } from './common/IdentityEntity';
import { BlogComment } from './BlogComment';

/**
 * 블로그 (blogs)
 */
@Entity({ name: 'blog' })
export class Blog extends IdentityEntity {
  /**
   * 작성자(관리자)
   */
  @Column({ type: 'integer', nullable: true, comment: '작성자(관리자)' })
  userId?: number;

  /**
   * 제목
   */
  @Column({ type: 'varchar', length: 100, comment: '제목' })
  title: string;

  /**
   * 프리뷰
   */
  @Column({ type: 'varchar', length: 200, nullable: true, comment: '프리뷰' })
  preview?: string;

  /**
   * 내용
   */
  @Column({ type: 'text', comment: '내용' })
  content: string;

  /**
   * 영어 번역 내용
   */
  @Column({ type: 'text', nullable: true, comment: '영어번역내용' })
  contentEnglish?: string;
  /**
   * 카테고리
   */
  @Column({ type: 'varchar', length: 10, nullable: true, comment: '카테고리' })
  category?: string;

  /**
   * AI 요약 내용
   */
  @Column({ type: 'text', nullable: true, comment: 'AI 요약 내용' })
  contentSummary?: string;

  /**
   * 조회수
   */
  @Column({ type: 'integer', default: 0, comment: '조회수' })
  viewCount?: number;

  @OneToMany(() => BlogComment, (blogComment) => blogComment.blog, {
    cascade: true,
  })
  comments?: BlogComment[];
}
