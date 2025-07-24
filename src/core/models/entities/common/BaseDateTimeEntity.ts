import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 생성일, 수정일, 삭제일을 자동으로 관리하는 추상 엔티티 클래스입니다.
 *
 * TypeORM의 `@CreateDateColumn`, `@UpdateDateColumn`, `@DeleteDateColumn`을 활용하여
 * 레코드의 생성, 수정, 삭제 시간을 자동으로 기록합니다.
 * 모든 엔티티는 이 클래스를 상속받아 타임스탬프를 공통으로 관리할 수 있습니다.
 *
 * 주요 기능:
 * - createDateTime: 레코드 생성 시 자동 기록
 * - updateDateTime: 레코드 수정 시 자동 갱신
 * - deleteDateTime: 소프트 삭제 시 자동 기록
 *
 * 주의사항:
 * - `deleteDateTime`은 실제 삭제가 아닌 소프트 딜리트(논리적 삭제)에 사용됩니다.
 * - 컬럼 타입은 `datetime`이며, 각 필드는 DB에서 자동으로 채워집니다.
 */
export abstract class BaseDateTimeEntity {
  @CreateDateColumn({ type: 'datetime', name: 'create_date_time', comment: '생성일시' })
  createDateTime!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_date_time', comment: '수정일시' })
  updateDateTime?: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'delete_date_time', comment: '삭제일시' })
  deleteDateTime?: Date;
}
