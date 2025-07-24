/**
 * 정렬 기준을 나타내는 열거형(enum)입니다.
 *
 * 목록 조회 시 오름차순 또는 내림차순 정렬을 지정할 때 사용됩니다.
 *
 * 주요 값:
 * - ASC: 오름차순 정렬
 * - DESC: 내림차순 정렬
 *
 * 주의사항:
 * - 대문자 문자열('ASC' | 'DESC')로 유지해야 TypeORM 등에서 정상 작동합니다.
 */
export enum OrderBy {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * 사용자의 권한 등급을 나타내는 열거형(enum)입니다.
 *
 * 주요 값:
 * - GUEST: 비회원 사용자
 * - USER: 일반 로그인 사용자
 * - ADMINISTRATOR: 관리자 권한 사용자
 *
 * 주의사항:
 * - 세션 및 라우팅 권한 체크 등에 사용됩니다.
 */
export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  ADMINISTRATOR = 'administrator',
}

/**
 * UserRole 열거형을 기반으로 한 별칭 타입입니다.
 *
 * 용도:
 * - 타입 유추가 불분명한 곳에 명확하게 역할 타입을 지정할 때 사용
 */
export type UserRoleType = UserRole;

/**
 * UserRole 열거형의 모든 값을 배열로 나열한 상수입니다.
 *
 * 용도:
 * - 모든 사용자 권한 목록이 필요한 경우 사용 (예: 관리자 페이지 필터 등)
 */
export const ALL_USER_ROLES: UserRole[] = Object.values(UserRole);

/**
 * 인증된 사용자(로그인 필요)의 권한만 포함된 배열입니다.
 *
 * 포함된 권한:
 * - USER
 * - ADMINISTRATOR
 *
 * 용도:
 * - 로그인 상태에서만 접근 가능한 리소스 보호 시 활용
 */
export const AUTHENTICATED_ROLES: UserRole[] = [UserRole.USER, UserRole.ADMINISTRATOR];

/**
 * 관리자 권한만 포함된 배열입니다.
 *
 * 포함된 권한:
 * - ADMINISTRATOR
 *
 * 용도:
 * - 관리자 전용 페이지 또는 기능 접근 제한 시 사용
 */
export const ADMINISTRATOR_ROLES: UserRole[] = [UserRole.ADMINISTRATOR];

/**
 * 문의 게시글의 분류를 나타내는 열거형(enum)입니다.
 *
 * 이 값은 게시글 작성 시 사용자가 선택하는 카테고리이며,
 * 데이터베이스에 문자열(enum value)로 저장됩니다.
 *
 * 주요 값:
 * - TECH: 기술 관련 문의
 * - REPORT: 사용자 신고 또는 문제 제보
 * - ETC: 그 외 기타 문의
 *
 * 주의사항:
 * - DB 저장 시 실제 값은 '기술', '신고', '기타' 한글 문자열로 저장됩니다.
 */

export enum InquiryCategory {
  TECH = '기술',
  REPORT = '신고',
  ETC = '기타',
}

/**
 * 시스템 내에서 수행할 작업의 유형을 정의하는 열거형입니다.
 *
 * @enum {number}
 *
 * @property {number} CREATE - 생성 작업
 * @property {number} UPDATE - 수정 작업
 * @property {number} DELETE - 삭제 작업
 * @property {number} READ - 단건 조회 작업
 * @property {number} LIST - 목록 조회 작업
 * @property {number} LOGIN - 로그인 작업
 * @property {number} LOGOUT - 로그아웃 작업
 *
 * @example
 * if (jobType === JobType.UPDATE) {
 *   // 수정 작업 처리
 * }
 */
export enum JobType {
  CREATE = 0,
  UPDATE = 1,
  DELETE = 2,
  READ = 3,
  LIST = 4,
  LOGIN = 5,
  LOGOUT = 6,
}

/**
 * 기본 정렬 컬럼 이름을 상수로 정의한 객체입니다.
 *
 * @property {'id'} ID - 고유 ID 컬럼
 * @property {'createDateTime'} CREATE_DATE_TIME - 생성일시 컬럼
 * @property {'updateDateTime'} UPDATE_DATE_TIME - 수정일시 컬럼
 * @property {'deleteDateTime'} DELETE_DATE_TIME - 삭제일시 컬럼
 *
 * @example
 * orderBy: DefaultSearchOrderColumn.CREATE_DATE_TIME
 */
export const DefaultSearchOrderColumn = {
  ID: 'id',
  CREATE_DATE_TIME: 'createDateTime',
  UPDATE_DATE_TIME: 'updateDateTime',
  DELETE_DATE_TIME: 'deleteDateTime',
} as const;

/**
 * 전역적으로 유효한 정렬 대상 컬럼의 배열입니다.
 *
 * @description
 * - 기본적으로 모든 리스트 조회 API에서 사용할 수 있는 정렬 컬럼 목록입니다.
 * - 이 배열의 항목만 정렬 컬럼으로 사용할 수 있도록 제한하여 보안 및 무결성 확보
 */
export const VALID_ORDER_COLUMNS = [
  DefaultSearchOrderColumn.CREATE_DATE_TIME,
  DefaultSearchOrderColumn.UPDATE_DATE_TIME,
  DefaultSearchOrderColumn.DELETE_DATE_TIME,
  'title',
] as const;

/**
 * 문의 검색에서 사용할 수 있는 정렬 컬럼의 배열입니다.
 *
 * @description
 * - 문의 게시글 전용으로 허용된 정렬 대상 컬럼입니다.
 * - VALID_ORDER_COLUMNS에 추가로 `writer`가 포함됩니다.
 */
export const InquirySearchOrderColumn = [
  DefaultSearchOrderColumn.CREATE_DATE_TIME,
  DefaultSearchOrderColumn.UPDATE_DATE_TIME,
  DefaultSearchOrderColumn.DELETE_DATE_TIME,
  'writer',
  'title',
] as const;

/**
 * VALID_ORDER_COLUMNS 배열에서 사용할 수 있는 정렬 컬럼 타입입니다.
 */
export type ValidOrderColumns = (typeof VALID_ORDER_COLUMNS)[number];

/**
 * DefaultSearchOrderColumn 객체에서 정의한 정렬 컬럼 타입입니다.
 */
export type DefaultSearchOrderColumn =
  (typeof DefaultSearchOrderColumn)[keyof typeof DefaultSearchOrderColumn];

/**
 * InquirySearchOrderColumn 배열에서 사용할 수 있는 정렬 컬럼 타입입니다.
 */

export type InquirySearchOrderColumn = (typeof InquirySearchOrderColumn)[number];

export enum PersonalInformationGender {
  MALE = '남성',
  FEMALE = '여성',
}
