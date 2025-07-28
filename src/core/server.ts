/**
 * 공통 백엔드(core) 모듈의 엔트리 포인트입니다.
 *
 * 이 파일은 하위 모듈들을 재노출하여 외부에서 간편하게 접근할 수 있도록 합니다.
 *
 * 주요 내보내기 항목:
 * - database.config: 실행 환경에 따른 TypeORM 데이터베이스 설정 반환
 * - authentication.middleware: Express용 JWT 기반 인증 미들웨어
 * - authorization: 사용자 권한 관련 유틸리티 및 상수 집합
 *
 * 사용 예시:
 * ```ts
 * import { databaseConfig, authenticateJwt, requireRoles } from '@repo/backend-core';
 * ```
 *
 * 주의사항:
 * - 이 파일은 `@repo/backend-core` 패키지의 진입점(index)으로 간주되며, 외부 사용을 전제로 구성되어야 합니다.
 */

export * from './config/DatabaseConfig';
export * from './middlewares/JwtAuthenticationMiddleware';
