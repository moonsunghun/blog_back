import { Column, Entity } from 'typeorm';
import { IdentityEntity } from '../common/IdentityEntity';
import { PersonalInformationGender } from '../../../types/Enum';
import { databaseAwareEnumColumn } from '../../../helpers/column-helper';

/**
 * 포트폴리오 유저 개인정보 엔티티 클래스입니다.
 *
 * 이 클래스는 이름, 생년월일, 성별, 프로필사진, 주소, 이메일, 전화번호 등의 정보를 저장합니다.
 *
 * 주요 필드:
 * - name: 이름
 * - birthDate: 생년월일
 * - gender: 성별 (enum)
 * - address: 주소
 * - email: 이메일
 * - contact: 전화번호
 *
 */
@Entity('personal_information')
export class PersonalInformation extends IdentityEntity {
  @Column('varchar', { length: 50, nullable: false, comment: '이름' })
  name: string;

  @Column('date', { nullable: false, comment: '생년월일' })
  birthDate: Date;

  @Column(
    databaseAwareEnumColumn(PersonalInformationGender, '성별', {
      nullable: false,
      default: '기타',
    })
  )
  gender!: PersonalInformationGender;

  @Column('varchar', { length: 100, nullable: false, comment: '주소' })
  address: string;

  @Column('varchar', { length: 30, nullable: false, comment: '이메일' })
  email: string;

  @Column('varchar', { length: 30, nullable: false, comment: '전화번호' })
  contact: string;
}
