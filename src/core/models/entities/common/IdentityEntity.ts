import { BaseDateTimeEntity } from './BaseDateTimeEntity';
import { PrimaryGeneratedColumn } from 'typeorm';

/**
 * 기본 엔티티 식별자(Primary Key)를 포함하는 추상 엔티티 클래스입니다.
 *
 * 이 클래스는 모든 엔티티의 공통 상위 클래스(BaseDateTimeEntity)를 상속하며,
 * 각 레코드의 고유 ID를 `id` 필드로 자동 생성합니다.
 *
 * 주요 기능:
 * - id 필드는 데이터베이스에서 자동 증가 방식(`increment`)으로 생성됩니다.
 * - BaseDateTimeEntity를 상속하여 생성/수정 시간도 함께 관리됩니다.
 *
 * 주의사항:
 * - 이 클래스는 직접 사용되지 않으며, 하위 엔티티에서 상속하여 사용합니다.
 */
export abstract class IdentityEntity extends BaseDateTimeEntity {
  @PrimaryGeneratedColumn('increment', { comment: '고유번호' })
  id!: number;
}
