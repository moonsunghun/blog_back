import { ColumnOptions } from 'typeorm';

/**
 * 데이터베이스 종류에 따라 enum 컬럼 타입을 자동으로 설정해주는 유틸 함수입니다.
 *
 * 이 함수는 PostgreSQL에서는 `enum` 타입을 사용하고,
 * 그 외(DB_TYPE이 postgres가 아닌 경우)에는 `varchar` 타입을 사용하여
 * enum을 저장할 수 있도록 TypeORM의 ColumnOptions을 반환합니다.
 *
 * 주요 기능:
 * - PostgreSQL 환경: `type: 'enum'` + enum 객체 적용
 * - SQLite: `type: 'varchar'`로 대체
 *
 * 주의사항:
 * - 환경변수 `DB_TYPE`은 `.env`에서 미리 정의되어 있어야 하며, 'postgres'로 정확히 입력되어야 합니다.
 * - overrides를 통해 nullable, default 등의 추가 ColumnOptions을 병합하여 사용할 수 있습니다.
 *
 * @template T enum 객체 타입
 * @param enumObject 열거형 enum 객체
 * @param comment 데이터베이스 컬럼 주석
 * @param overrides 추가 ColumnOptions (nullable, default 등)
 * @returns 적절한 ColumnOptions 객체
 *
 * @example
 * @Column(databaseAwareEnumColumn(MyEnum, '상태', { default: MyEnum.ACTIVE }))
 */
export function databaseAwareEnumColumn<T extends object>(
  enumObject: T,
  comment: string,
  overrides: Partial<ColumnOptions> = {}
): ColumnOptions {
  const databaseType: boolean = process.env.DB_TYPE === 'postgres';

  if (databaseType) {
    return {
      type: 'enum',
      enum: enumObject,
      comment,
      ...overrides,
    };
  }

  return {
    type: 'varchar',
    comment,
    ...overrides,
  };
}
