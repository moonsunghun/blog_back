import { Column, Entity } from 'typeorm';
import { IdentityEntity } from '../common/IdentityEntity';

/**
 * 포트폴리오 엔티티 클래스입니다.
 *
 * 이 클래스는 제목, 내용, 메인 포트폴리오 여부 등의 정보를 저장합니다.
 *
 * 주요 필드:
 * - title:포트폴리오 제목
 * - contentFormat: 포트폴리오 포맷 (예: HTML, Markdown)
 * - content:포트폴리오 내용
 * - mainState:메인 포트폴리오 여부
 * 
 */
@Entity('portfolio')
export class Portfolio extends IdentityEntity {
  @Column('varchar', { length: 50, nullable: false, comment: '제목' })
  title: string;

  @Column('varchar', {
    length: 10,
    nullable: false,
    comment: '포트폴리오 포맷 (HTML, Markdown 등)',
  })
  contentFormat: string;

  @Column('text', { nullable: false, comment: '포트폴리오 내용' })
  content: string;

  @Column('boolean', { default: false, nullable: false, comment: '메인 포트폴리오 여부' })
  mainState: boolean;
}
