import jwt from 'jsonwebtoken';
import { User } from '../models/entities/User';
import { UserRole } from '../types/Enum';
import { logger } from './Logger';

export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * JWT 토큰을 생성합니다.
 *
 * @param user - 사용자 정보
 * @param expiresIn - 토큰 만료 시간 (기본값: 24시간)
 * @returns JWT 토큰 문자열
 */
export const generateJwtToken = (
  user: User,
  expiresIn: string = '24h'
): string => {
  const secret = process.env.JWT_SECRET || 'your-jwt-secret-key';

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.userType,
  };

  try {
    const token = jwt.sign(payload, secret, {
      expiresIn,
      issuer: 'blog-api',
      audience: 'blog-users',
    } as any);

    logger.info(`JWT 토큰 생성 완료 - 사용자 ID: ${user.id}`);
    return token;
  } catch (error) {
    logger.error(`JWT 토큰 생성 실패: ${error}`);
    throw new Error('토큰 생성에 실패했습니다.');
  }
};

/**
 * JWT 토큰을 검증하고 페이로드를 반환합니다.
 *
 * @param token - JWT 토큰
 * @returns 검증된 페이로드
 * @throws 토큰이 유효하지 않거나 만료된 경우
 */
export const verifyJwtToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET || 'your-jwt-secret-key';

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'blog-api',
      audience: 'blog-users',
    }) as JwtPayload;

    logger.info(`JWT 토큰 검증 성공 - 사용자 ID: ${decoded.userId}`);
    return decoded;
  } catch (error: any) {
    logger.error(`JWT 토큰 검증 실패: ${error.message}`);

    if (error.name === 'TokenExpiredError') {
      throw new Error('토큰이 만료되었습니다.');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('유효하지 않은 토큰입니다.');
    } else {
      throw new Error('토큰 검증에 실패했습니다.');
    }
  }
};

/**
 * JWT 토큰을 디코딩합니다 (검증 없이).
 *
 * @param token - JWT 토큰
 * @returns 디코딩된 페이로드
 */
export const decodeJwtToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    return decoded;
  } catch (error) {
    logger.error(`JWT 토큰 디코딩 실패: ${error}`);
    return null;
  }
};

/**
 * Authorization 헤더에서 Bearer 토큰을 추출합니다.
 *
 * @param authHeader - Authorization 헤더 값
 * @returns 토큰 문자열 또는 null
 */
export const extractTokenFromHeader = (
  authHeader: string | undefined
): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // 'Bearer ' 제거
};
