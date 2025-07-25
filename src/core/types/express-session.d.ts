/**
 * express-session 모듈에 사용자 정보를 포함하는 세션 타입을 확장합니다.
 *
 * 이 선언은 TypeScript 환경에서 `request.session.user` 접근 시
 * 자동 완성과 타입 검사를 지원하도록 돕습니다.
 *
 * 주요 필드:
 * - id: 사용자 고유 번호
 * - username: 사용자 계정 아이디
 * - nickname: 사용자 표시 이름
 * - role: 사용자 권한 등급 (UserRoleType)
 * - rememberMeStatus: 로그인 유지 여부 (선택 필드)
 *
 * 주의사항:
 * - `express-session`을 사용하는 프로젝트에서만 유효합니다.
 * - 실제 세션에 이 정보가 존재하지 않으면 `undefined`가 반환될 수 있습니다.
 */
import 'express-session';
import { Cookie } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    cookie: Cookie;
    encryptedUserId: string;
    rememberMeStatus: boolean;
  }
}
