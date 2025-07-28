import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../types/Enum';
import { logger } from '../utilities/Logger';
import { HttpExceptionResponse } from '../api/exception/HttpExceptionResponse';
import { User } from '../models/entities/User';
import { AppDataSource } from '../config/DatabaseConfig';
import { Repository } from 'typeorm';
import {
  verifyJwtToken,
  extractTokenFromHeader,
  JwtPayload,
} from '../utilities/JwtUtils';

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
 * JWT 토큰을 검증하고 사용자 정보를 Request 객체에 추가하는 미들웨어
 *
 * @param req - Express 요청 객체
 * @param res - Express 응답 객체
 * @param next - 다음 미들웨어 함수
 */
export const authenticateJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      logger.warn('JWT 토큰이 제공되지 않음');
      return next();
    }

    const payload = verifyJwtToken(token);

    // 데이터베이스에서 사용자 정보 확인 (선택사항)
    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: payload.userId },
      select: ['id', 'email', 'userType', 'blockState'],
    });

    if (!user || user.blockState) {
      logger.warn(`차단된 사용자 또는 존재하지 않는 사용자: ${payload.userId}`);
      return next();
    }

    // Request 객체에 사용자 정보 추가
    req.user = {
      id: user.id,
      email: user.email,
      role: user.userType,
    };

    logger.info(`JWT 인증 성공 - 사용자 ID: ${user.id}`);
    next();
  } catch (error: any) {
    logger.warn(`JWT 인증 실패: ${error.message}`);
    return next();
  }
};

/**
 * 로그인이 필요한 엔드포인트를 위한 미들웨어
 *
 * @param req - Express 요청 객체
 * @param res - Express 응답 객체
 * @param next - 다음 미들웨어 함수
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    logger.warn('인증이 필요한 엔드포인트에 접근 시도 - 인증되지 않은 사용자');
    throw new HttpExceptionResponse(401, '로그인이 필요합니다.');
  }

  next();
};

/**
 * 특정 역할이 필요한 엔드포인트를 위한 미들웨어
 *
 * @param requiredRole - 필요한 역할
 * @returns 미들웨어 함수
 */
export const requireRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      logger.warn('역할 기반 접근 제어 - 인증되지 않은 사용자');
      throw new HttpExceptionResponse(401, '로그인이 필요합니다.');
    }

    if (
      req.user.role !== requiredRole &&
      req.user.role !== UserRole.ADMINISTRATOR
    ) {
      logger.warn(
        `권한 부족 - 사용자 역할: ${req.user.role}, 필요 역할: ${requiredRole}`
      );
      throw new HttpExceptionResponse(403, '접근 권한이 없습니다.');
    }

    next();
  };
};

/**
 * 관리자 권한이 필요한 엔드포인트를 위한 미들웨어
 *
 * @param req - Express 요청 객체
 * @param res - Express 응답 객체
 * @param next - 다음 미들웨어 함수
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    logger.warn('관리자 권한 필요 - 인증되지 않은 사용자');
    throw new HttpExceptionResponse(401, '로그인이 필요합니다.');
  }

  if (req.user.role !== UserRole.ADMINISTRATOR) {
    logger.warn(`관리자 권한 부족 - 사용자 역할: ${req.user.role}`);
    throw new HttpExceptionResponse(403, '관리자 권한이 필요합니다.');
  }

  next();
};

/**
 * 현재 로그인한 사용자의 역할을 반환하는 핸들러
 *
 * @param req - Express 요청 객체
 * @param res - Express 응답 객체
 */
export const getCurrentUserRole = (req: Request, res: Response): void => {
  try {
    const role = req.user?.role || UserRole.GUEST;

    logger.info(`사용자 역할 조회 - 역할: ${role}`);
    res.status(200).json(role);
  } catch (error: any) {
    logger.error(`사용자 역할 조회 실패: ${error.message}`);
    res.status(500).json({ error: '서버 내부 오류' });
  }
};
