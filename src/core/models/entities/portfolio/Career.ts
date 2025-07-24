import { Column, Entity } from 'typeorm';
import { IdentityEntity } from '../common/IdentityEntity';

/**
 * 포트폴리오 유저 경력 엔티티 클래스입니다.
 *
 * 주요 필드:
 * - companyName: 회사명
 * - position: 직급
 * - startDate: 시작일
 * - endDate: 종료일
 *
 */
@Entity('career')
export class Career extends IdentityEntity {
  @Column('varchar', { length: 100, nullable: false, comment: '회사명' })
  companyName: string;

  @Column('varchar', { length: 100, nullable: false, comment: '직급' })
  position: string;

  @Column('date', { nullable: false, comment: '입학일' })
  startDate: Date;

  @Column('date', { nullable: true, comment: '졸업일' })
  endDate: Date | null;
}
