/**
 * Express 애플리케이션에서 세션을 관리하는 미들웨어입니다.
 *
 * 이 미들웨어는 `express-session`을 사용하여 서버 측 세션을 생성하고,
 * 사용자 인증 상태나 기타 세션 기반 정보를 저장할 수 있도록 합니다.
 *
 * 주요 설정:
 * - `secret`: 세션 암호화 키 (환경 변수 SESSION_SECRET 사용, 기본값 존재)
 * - `resave`: 변경되지 않은 세션을 다시 저장하지 않음
 * - `saveUninitialized`: 초기화되지 않은 세션을 저장하지 않음
 * - `cookie.maxAge`: 세션 쿠키 유효 시간은 2시간 (단위: 밀리초)
 *
 * 주의사항:
 * - `maxAge` 설정에 논리 오류가 있어 실제 값이 0으로 평가될 수 있습니다.
 *   → `(1000 * 60 * 60)`로 수정 필요
 */
import { NextFunction, Request, Response } from 'express';
import 'express-session';
import { UserRole } from '../types/Enum';
import { logger } from '../utilities/Logger';
import { HttpExceptionResponse } from '../api/exception/HttpExceptionResponse';
import { User } from '../models/entities/User';
import { findBySessionUserId } from '../utilities/Finder';
import { AppDataSource } from '../config/DatabaseConfig';
import { Repository } from 'typeorm';
import { decryptUserByEncryptedUserId } from '../utilities/Encyprter';

// Express Session 확장 인터페이스
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
 * 관리자 전용 인증/인가 미들웨어입니다.
 *
 * 세션 정보를 기반으로 로그인된 사용자가 관리자(ADMINISTRATOR)인지 확인합니다.
 * 관리자가 아닌 경우, 404 Not Found 예외를 발생시킵니다.
 *
 * @param {Request} request - Express 요청 객체
 * @param {Response} _response - Express 응답 객체 (사용하지 않음)
 * @param {NextFunction} next - 다음 미들웨어로의 함수 호출
 *
 * @returns {Promise<void>}
 *
 * @throws {HttpExceptionResponse} 세션이 없거나 관리자가 아닌 경우 404 또는 401 에러 반환
 */
export const authenticationCheckForAdministrator = async (
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> => {
  logger.info(`[authenticationCheckForAdministrator] 시작`);

  try {
    const user: User | null = await findBySessionUserId(request);

    checkUser(user, next);

    if (user!.userType !== UserRole.ADMINISTRATOR) {
      logger.error(`접근 권한이 없는 이용자 접근 시도 발생 - 이용자 정보: ${JSON.stringify(user)}`);

      logger.error(`[authenticationCheckForMember] 종료`);

      return next(new HttpExceptionResponse(404, '존재하지 않는 리소스'));
    }

    logger.info(`[authenticationCheckForAdministrator] 종료`);

    return next();
  } catch (error: any) {
    logger.error(`[authenticationCheckForAdministrator] 문제 발생 - 문제 내용: ${error.message}`);

    next(error);
  }
};

/**
 * 회원 전용 인증/인가 미들웨어입니다.
 *
 * 세션 정보를 기반으로 로그인된 사용자가 일반 회원(USER)인지 확인합니다.
 * 회원이 아닌 경우, 404 Not Found 예외를 발생시킵니다.
 *
 * @param {Request} request - Express 요청 객체
 * @param {Response} _response - Express 응답 객체 (사용하지 않음)
 * @param {NextFunction} next - 다음 미들웨어로의 함수 호출
 *
 * @returns {Promise<void>}
 *
 * @throws {HttpExceptionResponse} 세션이 없거나 일반 회원이 아닌 경우 404 또는 401 에러 반환
 */
export const authenticationCheckForMember = async (
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user: User | null = await findBySessionUserId(request);

    checkUser(user, next);

    if (user!.userType !== UserRole.USER) {
      logger.error(
        `회원 전용 자원에 관리자 혹은 비회원 접근 시도 - 이용자 정보: ${JSON.stringify(user)}`
      );

      logger.error(`[authenticationCheckForMember] 종료`);

      return next(new HttpExceptionResponse(404, '존재하지 않는 리소스'));
    }

    logger.info(`[authenticationCheckForMember] 종료`);

    return next();
  } catch (error: any) {
    logger.error(`[authenticationCheckForMember] 문제 발생 - 문제 내용: ${error.message}`);

    next(error);
  }
};

/**
 * 관리자 및 일반 회원 공통 인증/인가 미들웨어입니다.
 *
 * 세션 정보를 기반으로 로그인된 사용자가 관리자(ADMINISTRATOR) 또는 일반 회원(USER)인지 확인합니다.
 * 비회원(GUEST)인 경우, 404 Not Found 예외를 발생시킵니다.
 *
 * @param {Request} request - Express 요청 객체 (세션 포함)
 * @param {Response} _response - Express 응답 객체 (사용하지 않음)
 * @param {NextFunction} next - 다음 미들웨어로의 함수 호출
 *
 * @returns {Promise<void>}
 *
 * @throws {HttpExceptionResponse} 세션이 없거나 비회원인 경우 404 또는 401 에러 반환
 */
export const authenticationCheckForAdministratorAndUser = async (
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> => {
  logger.info(`[authenticationCheckForAdministratorAndUser] 시작`);

  try {
    const user: User | null = await findBySessionUserId(request);

    checkUser(user, next);

    if (user!.userType === UserRole.GUEST) {
      logger.error(
        `관리자 및 회원 공통 자원에 비회원 접근 시도 - 이용자 정보: ${JSON.stringify(user)}`
      );

      logger.error(`[authenticationCheckForAdministratorAndUser] 종료`);

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

export const getUserRole = async (request: Request, response: Response, _next: NextFunction) => {
  try {
    const user: User | undefined = await resolveAuthenticatedUser(request);

    let role: UserRole;

    if (!user) {
      role = UserRole.GUEST;
    } else if (user.userType === UserRole.USER) {
      role = UserRole.USER;
    } else if (user.userType === UserRole.ADMINISTRATOR) {
      role = UserRole.ADMINISTRATOR;
    } else {
      role = UserRole.GUEST;
    }

    return response.status(200).json({
      statusCode: 200,
      message: '이용자 권한 조회 조회 성공',
      data: role,
    });
  } catch (error: any) {
    logger.error(`[getUserRole] 이용자 권한 조회 중 문제 발생 - 문제 내용: ${error.message}`);

    return response.status(500).json({ message: '이용자 권한 조회 중 서버 내부 오류 발생' });
  }
};

/**
 * 관리자 외 회원 및 비회원만 접근 가능한 자원에 대한 인증 미들웨어입니다.
 *
 * @param {Request} request - Express 요청 객체
 * @param {Response} _response - Express 응답 객체 (사용되지 않음)
 * @param {NextFunction} next - 다음 미들웨어로의 제어 함수
 *
 * @returns {Promise<void>}
 *
 * @throws {HttpExceptionResponse} 관리자가 접근 시도할 경우 401 예외 반환
 *
 * @description
 * - 세션에 저장된 사용자 정보(`encryptedUserId`)를 복호화하여 사용자의 권한을 확인합니다.
 * - 사용자 유형이 `ADMINISTRATOR`일 경우 접근을 차단하고 로그를 남깁니다.
 * - 그 외 `USER` 또는 `GUEST`는 통과시킵니다.
 *
 * @example
 * app.get('/guest-or-user-only', authenticationCheckForUserOfGuest, controllerHandler);
 */
export const authenticationCheckForUserOfGuest = async (
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info(`[authenticationCheckForUserOfGuest] 시작`);

    const user: User | null = await findBySessionUserId(request);

    if (!user) {
      return next();
    }

    if (user.userType === UserRole.ADMINISTRATOR) {
      logger.error(
        `관리자가 이용할 수 없는 자원에 관리자 접근 시도 - 이용자 정보: ${JSON.stringify(user)}`
      );

      logger.error(`[authenticationCheckForUserOfGuest] 종료`);

      return next(new HttpExceptionResponse(401, '관리자는 이용할 수 없는 서비스 입니다.'));
    }

    logger.info(`[authenticationCheckForUserOfGuest] 종료`);

    return next();
  } catch (error: any) {
    logger.error(`[authenticationCheckForUserOfGuest] 문제 발생 - 문제 내용: ${error.message}`);

    next(error);
  }
};

/**
 * 사용자 존재 여부를 확인하는 인가 유틸 함수입니다.
 *
 * 인증된 사용자가 존재하지 않으면, 404 예외를 발생시켜 접근을 제한합니다.
 *
 * @param {User | null} user - 복호화된 사용자 정보
 * @param {NextFunction} next - Express 다음 미들웨어 함수
 *
 * @throws {HttpExceptionResponse} 인증되지 않은 접근 시 404 예외를 발생
 */
const checkUser = (user: User | null, next: NextFunction) => {
  if (!user) {
    logger.error(`권한 없는 접근 시도 발생`);

    return next(new HttpExceptionResponse(404, '존재하지 않는 리소스'));
  }
};

/**
 * 세션에서 사용자 정보를 복호화하여 로그인된 사용자를 확인합니다.
 *
 * 세션에 저장된 `encryptedUserId`를 기반으로 전체 사용자 목록 중 매칭되는 사용자를 찾아 반환합니다.
 * 복호화가 실패하거나 유효한 사용자를 찾지 못한 경우, 예외를 발생시킵니다.
 *
 * @param {Request} request - Express 요청 객체 (세션 포함)
 * @returns {Promise<User>} 세션에 매칭되는 로그인 사용자 정보
 *
 * @throws {HttpExceptionResponse} 세션이 없거나 유효한 사용자 정보를 찾지 못한 경우 401 에러 반환
 */
const resolveAuthenticatedUser = async (request: Request): Promise<User> => {
  const sessionData = request.session as ExtendedSessionData;
  const encryptedUserId: string | undefined = sessionData.encryptedUserId;

  logger.info(`request.session: ${JSON.stringify(request.session)}`);
  logger.info(`[auth] sessionID: ${request.sessionID}`);
  logger.info(`encryptedUserId: ${encryptedUserId}`);

  if (!encryptedUserId) {
    throw new HttpExceptionResponse(401, '로그인 필요');
  }

  const userRepository: Repository<User> = AppDataSource.getRepository(User);
  const candidates: User[] = await userRepository.find({
    select: ['id', 'userType', 'email'],
  });

  for (const user of candidates) {
    try {
      const decryptedUserInformation: { userId: number; userType: string } =
        decryptUserByEncryptedUserId(encryptedUserId, user);

      if (decryptedUserInformation.userId === user.id) {
        return user;
      }
    } catch (error: any) {
      logger.warn(`[resolveAuthenticatedUser] 복호화 실패: ${error.message}`);
    }
  }

  throw new HttpExceptionResponse(401, '세션 정보가 유효하지 않음');
};
