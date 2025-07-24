import { Column, Entity } from 'typeorm';
import { IdentityEntity } from './common/IdentityEntity';
import { databaseAwareEnumColumn } from '../../helpers/column-helper';
import { UserRole } from '../../types/Enum';

/**
 * 회원(User) 엔티티 클래스입니다.
 *
 * users_v4.erd의 user 테이블 구조를 기반으로 하며,
 * Inquiry 엔티티의 코드 스타일을 따릅니다.
 *
 * 주요 필드:
 * - nickName: 별명
 * - email: 이메일(고유)
 * - password: 해싱된 비밀번호
 * - userType: 회원 종류 (USER, ADMIN)
 * - loginAttemptCount: 로그인 시도 횟수
 * - blockState: 차단 여부
 *
 * 날짜 관련 필드는 IdentityEntity(BaseDateTimeEntity)에서 상속받아 관리합니다.
 */
@Entity('user')
export class User extends IdentityEntity {
  @Column('varchar', { length: 50, nullable: false, comment: '별명' })
  nickName!: string;

  @Column('varchar', { length: 100, unique: true, nullable: false, comment: '이메일' })
  email!: string;

  @Column('varchar', { length: 255, nullable: false, comment: '해싱된 비밀번호' })
  password!: string;

  @Column(
    databaseAwareEnumColumn(UserRole, '회원 종류', {
      length: 10,
      nullable: false,
      default: UserRole.USER,
    })
  )
  userType!: UserRole;

  @Column('int', {
    name: 'login_attempt_count',
    default: 0,
    nullable: false,
    comment: '로그인 시도 횟수',
  })
  loginAttemptCount!: number;

  @Column('boolean', { name: 'block_state', default: false, nullable: false, comment: '차단 여부' })
  blockState!: boolean;

  // 탈퇴 일자(soft delete와 별도 관리)
  @Column('datetime', { name: 'withdrawn_date_time', nullable: true, comment: '탈퇴 일자' })
  withdrawnDateTime: Date | null;
}
