import { Column, Entity } from 'typeorm';
import { IdentityEntity } from '../common/IdentityEntity';

/**
 * 포트폴리오 유저 학력 엔티티 클래스입니다.
 *
 * 주요 필드:
 * - schoolName: 학교명
 * - major: 전공
 * - degree: 학위
 * - startDate: 입학일
 * - endDate: 졸업일
 *
 */
@Entity('education')
export class Education extends IdentityEntity {
  @Column('varchar', { length: 100, nullable: false, comment: '학교명' })
  schoolName: string;

  @Column('varchar', { length: 100, nullable: false, comment: '전공' })
  major: string;

  @Column('varchar', { nullable: true, length: 200, comment: '학위' })
  degree: string | null;

  @Column('date', { nullable: false, comment: '입학일' })
  startDate: Date;

  @Column('date', { nullable: true, comment: '졸업일' })
  endDate: Date | null;
}
