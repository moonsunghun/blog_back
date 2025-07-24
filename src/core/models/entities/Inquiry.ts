import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { InquiryCategory } from '../../types/Enum';
import { IdentityEntity } from './common/IdentityEntity';
import { databaseAwareEnumColumn } from '../../helpers/column-helper';
import { ApplicationFile } from './common/ApplicationFile';
import { InquiryComment } from './InquiryComment';
import { User } from './User';

/**
 * 문의 게시글을 나타내는 엔티티 클래스입니다.
 *
 * 이 클래스는 비회원 문의 기능을 위한 게시글 정보를 포함하며,
 * 제목, 내용, 카테고리, 답변 여부 등의 정보를 저장합니다.
 * 또한 첨부 파일과의 관계도 포함되어 있습니다.
 *
 * 주요 필드:
 * - guestNickName: 비회원 작성자 별명
 * - guestPassword: 비회원 작성글 비밀번호
 * - title: 게시글 제목
 * - contentFormat: 게시글 포맷 (예: HTML, Markdown)
 * - category: 문의 유형 (Enum)
 * - answerStatus: 답변 완료 여부
 * - content: 게시글 본문
 * - files: 첨부된 파일 목록
 * - comments: 게시글 댓글 목록
 *
 * 주의사항:
 * - `ApplicationFile`과의 관계는 단방향이며, 다형성 관계로 구성되어 있습니다.
 * - 다형성 관계는 공식적인 foreign key가 아닌 논리적 연관입니다.
 */
@Entity('inquiry')
export class Inquiry extends IdentityEntity {
  @ManyToOne(() => User, { nullable: true })
  user?: User | null;

  @Column('varchar', { length: 50, unique: true, nullable: true, comment: '비회원 작성자 별명' })
  guestNickName?: string;

  @Column('varchar', { length: 255, nullable: true, comment: '비회원 작성자 작성글 비밀번호' })
  guestPassword?: string;

  @Column('varchar', { length: 50, nullable: false, comment: '제목' })
  title!: string;

  @Column('varchar', { length: 10, nullable: true, comment: '게시글 형식 (HTML, Markdown 등)' })
  contentFormat?: string;

  @Column(
    databaseAwareEnumColumn(InquiryCategory, '문의 게시글 유형', {
      nullable: false,
      default: '기타',
    })
  )
  category!: InquiryCategory;

  @Column('boolean', { default: false, nullable: false, comment: '문의 답변 여부' })
  answerStatus!: boolean;

  @Column('text', { nullable: false, comment: '게시글 내용' })
  content!: string;

  // 관계 설명: Inquiry(1) ↔ ApplicationFile(N)
  // ApplicationFile 테이블에서 relatedId로 Inquiry의 id를 참조 (비공식 관계)
  // 단방향 관계로만 설정하며, 다형성 파일 테이블로 사용
  @OneToMany(() => ApplicationFile, () => null, {
    cascade: true,
  })
  files?: ApplicationFile[];

  @OneToMany(() => InquiryComment, (inquiryComment) => inquiryComment.inquiry, {
    cascade: true,
  })
  comments?: InquiryComment[];
}
