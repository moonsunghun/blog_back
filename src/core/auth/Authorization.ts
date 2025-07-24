/**
 * 사용자 권한을 검사하는 Express 미들웨어 함수입니다.
 *
 * 이 함수는 요청 세션에 포함된 사용자 역할을 확인하고,
 * 지정된 역할 목록에 포함되어 있지 않으면 404 응답을 반환합니다.
 *
 * 주요 동작:
 * - 세션에서 사용자 역할 추출 (없을 경우 GUEST로 처리)
 * - 지정된 역할 배열(roles)에 포함되어 있는지 확인
 * - 미포함 시 404 응답 반환, 포함 시 다음 미들웨어 실행
 *
 * 주의사항:
 * - 세션에 user 객체 또는 role 정보가 없을 경우 기본값은 GUEST입니다.
 * - 권한 없음 시 403이 아닌 404를 반환합니다 (보안 목적 추정).
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/Enum';

// 세션 데이터 타입 정의
interface ExtendedSessionData {
  encryptedUserId?: string;
  rememberMeStatus?: boolean;
  user?: {
    id: number;
    username: string;
    nickname: string;
    role: UserRole;
  };
}

/**
 * 지정된 역할(role)만 접근 가능한 라우트 보호 미들웨어입니다.
 *
 * @param roles 접근을 허용할 사용자 역할 목록
 * @returns Express 미들웨어 함수
 */

export const requireRoles = (
  roles: UserRole[]
): ((request: Request, response: Response, next: NextFunction) => void) => {
  return (request: Request, response: Response, next: NextFunction) => {
    const sessionData = request.session as ExtendedSessionData;
    const userRole: UserRole = sessionData.user?.role ?? UserRole.GUEST;

    if (!roles.includes(userRole)) {
      return response.status(404).json({
        // 보안상의 이유로 권한 없음 시 404 반환
        message: '페이지 찾을 수 없음',
      });
    }

    next();
  };
};
