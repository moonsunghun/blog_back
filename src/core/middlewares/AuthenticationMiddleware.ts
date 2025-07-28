/**
 * JWT 기반 인증/인가 미들웨어입니다.
 *
 * ⚠️  이 파일은 레거시 미들웨어입니다.
 * 새로운 JWT 인증 미들웨어를 사용하세요:
 *
 * - requireAuth: 로그인 필수
 * - requireRole: 특정 역할 필요
 * - requireAdmin: 관리자 권한 필요
 * - getCurrentUserRole: 현재 사용자 역할 조회
 *
 * @see src/core/middlewares/JwtAuthenticationMiddleware.ts
 */

import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../types/Enum';
import { logger } from '../utilities/Logger';
import { HttpExceptionResponse } from '../api/exception/HttpExceptionResponse';

// Request 객체에 사용자 정보를 추가하기 위한 인터페이스 확장
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: UserRole;
      };
    }
  }
}

/**
 * @deprecated JwtAuthenticationMiddleware의 requireAdmin을 사용하세요
 */
export const authenticationCheckForAdministrator = async (
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> => {
  logger.warn(
    'authenticationCheckForAdministrator는 deprecated되었습니다. requireAdmin을 사용하세요.'
  );

  try {
    if (!request.user) {
      logger.error(`인증되지 않은 사용자의 관리자 권한 접근 시도`);
      return next(new HttpExceptionResponse(401, '로그인이 필요합니다'));
    }

    if (request.user.role !== UserRole.ADMINISTRATOR) {
      logger.error(
        `관리자 권한이 없는 이용자 접근 시도 - 사용자 역할: ${request.user.role}`
      );
      return next(new HttpExceptionResponse(404, '존재하지 않는 리소스'));
    }

    logger.info(`[authenticationCheckForAdministrator] 종료`);
    return next();
  } catch (error: any) {
    logger.error(
      `[authenticationCheckForAdministrator] 문제 발생 - 문제 내용: ${error.message}`
    );
    next(error);
  }
};

/**
 * @deprecated JwtAuthenticationMiddleware의 requireRole을 사용하세요
 */
export const authenticationCheckForMember = async (
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> => {
  logger.warn(
    'authenticationCheckForMember는 deprecated되었습니다. requireRole을 사용하세요.'
  );

  logger.info(`[authenticationCheckForMember] 시작`);

  try {
    if (!request.user) {
      logger.error(`인증되지 않은 사용자의 회원 권한 접근 시도`);
      return next(new HttpExceptionResponse(401, '로그인이 필요합니다'));
    }

    if (
      request.user.role !== UserRole.USER &&
      request.user.role !== UserRole.ADMINISTRATOR
    ) {
      logger.error(
        `회원 권한이 없는 이용자 접근 시도 - 사용자 역할: ${request.user.role}`
      );
      return next(new HttpExceptionResponse(404, '존재하지 않는 리소스'));
    }

    logger.info(`[authenticationCheckForMember] 종료`);
    return next();
  } catch (error: any) {
    logger.error(
      `[authenticationCheckForMember] 문제 발생 - 문제 내용: ${error.message}`
    );
    next(error);
  }
};

/**
 * @deprecated JwtAuthenticationMiddleware의 requireAuth를 사용하세요
 */
export const authenticationCheckForAdministratorAndUser = async (
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> => {
  logger.warn(
    'authenticationCheckForAdministratorAndUser는 deprecated되었습니다. requireAuth를 사용하세요.'
  );

  logger.info(`[authenticationCheckForAdministratorAndUser] 시작`);

  try {
    if (!request.user) {
      logger.error(`인증되지 않은 사용자의 접근 시도`);
      return next(new HttpExceptionResponse(404, '존재하지 않는 리소스'));
    }

    logger.info(`[authenticationCheckForAdministratorAndUser] 종료`);
    return next();
  } catch (error: any) {
    logger.error(
      `[authenticationCheckForAdministratorAndUser] 문제 발생 - 문제 내용: ${error.message}`
    );
    next(error);
  }
};

/**
 * @deprecated JwtAuthenticationMiddleware의 getCurrentUserRole을 사용하세요
 */
export const getUserRole = async (
  request: Request,
  response: Response,
  _next: NextFunction
): Promise<void> => {
  logger.warn(
    'getUserRole는 deprecated되었습니다. getCurrentUserRole을 사용하세요.'
  );

  try {
    const role = request.user?.role || UserRole.GUEST;

    logger.info(`사용자 역할 조회 - 역할: ${role}`);
    response.status(200).json(role);
  } catch (error: any) {
    logger.error(`사용자 역할 조회 실패: ${error.message}`);
    response.status(500).json({ error: '서버 내부 오류' });
  }
};

/**
 * 사용자 또는 게스트 접근 허용 미들웨어입니다.
 *
 * JWT 토큰이 있으면 사용자 정보를 확인하고, 없으면 게스트로 처리합니다.
 * 모든 사용자(인증된 사용자 및 게스트)의 접근을 허용합니다.
 *
 * @param {Request} request - Express 요청 객체
 * @param {Response} _response - Express 응답 객체 (사용하지 않음)
 * @param {NextFunction} next - 다음 미들웨어로의 함수 호출
 *
 * @returns {Promise<void>}
 */
export const authenticationCheckForUserOfGuest = async (
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> => {
  logger.info(`[authenticationCheckForUserOfGuest] 시작`);

  try {
    // JWT 토큰이 있으면 사용자 정보가 이미 request.user에 설정되어 있음
    // 토큰이 없으면 request.user는 undefined이므로 게스트로 처리
    const userType = request.user ? '인증된 사용자' : '게스트';
    logger.info(`[authenticationCheckForUserOfGuest] 사용자 타입: ${userType}`);

    logger.info(`[authenticationCheckForUserOfGuest] 종료`);
    return next();
  } catch (error: any) {
    logger.error(
      `[authenticationCheckForUserOfGuest] 문제 발생 - 문제 내용: ${error.message}`
    );
    next(error);
  }
};
