import { Request } from 'express';
import { logger } from './Logger';
import { User } from '../models/entities/User';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/DatabaseConfig';
import { decryptUserByEncryptedUserId } from './Encyprter';
import { Inquiry } from '../models/entities/Inquiry';
import { HttpExceptionResponse } from '../api/exception/HttpExceptionResponse';

// 세션 데이터 타입 정의
interface ExtendedSessionData {
  encryptedUserId?: string;
  rememberMeStatus?: boolean;
  user?: {
    id: number;
    username: string;
    nickname: string;
    role: string;
  };
}

/**
 * 세션을 기반으로 현재 로그인한 사용자의 닉네임을 조회합니다.
 *
 * @param {Request} request - Express 요청 객체 (세션 정보 포함)
 * @returns {Promise<string | undefined>} 사용자 닉네임 (없을 경우 undefined)
 *
 * @description
 * - 세션에서 암호화된 사용자 ID를 복호화하여 사용자 정보를 조회한 뒤,
 *   해당 사용자의 닉네임을 반환합니다.
 * - 로그인되어 있지 않거나 유효한 세션 정보가 없는 경우 `null`를 반환합니다.
 *
 * @example
 * const writer = await findByWriter(request);
 * if (writer) {
 *   console.log(`작성자: ${writer}`);
 * }
 */
export const findByWriter = async (request: Request): Promise<string | undefined> => {
  const user: User | null = await findBySessionUserId(request);

  if (!user) {
    return undefined;
  }

  return user?.nickName;
};

/**
 * 세션에서 암호화된 사용자 ID를 복호화하여 사용자 정보를 조회합니다.
 *
 * @param {Request} request - Express 요청 객체 (세션 정보 포함)
 * @returns {Promise<User | null>} 사용자 객체 (없을 경우 null)
 *
 * @description
 * - 세션에 저장된 `encryptedUserId`를 복호화한 후,
 *   전체 사용자 목록 중 일치하는 사용자를 찾아 반환합니다.
 * - 복호화 실패 또는 일치하는 사용자가 없을 경우 `null`를 반환합니다.
 * - 인증된 사용자가 필요한 서비스에서 사용됩니다.
 *
 * @throws {none} 복호화 실패는 로그로만 기록되며 예외를 throw 하지 않습니다.
 *
 * @example
 * const user = await findBySessionUserId(request);
 * if (user) {
 *   console.log(`로그인한 사용자 ID: ${user.id}`);
 * }
 */
export const findBySessionUserId = async (request: Request): Promise<User | null> => {
  logger.info(`[findBySessionUserId] 시작`);

  if (!request.session) {
    logger.error(`[findBySessionUserId] 세션 정보가 존재하지 않음`);
    throw new HttpExceptionResponse(403, '로그인 필요');
  }

  const sessionData = request.session as ExtendedSessionData;
  const encryptedUserId: string | undefined = sessionData.encryptedUserId;

  if (!encryptedUserId) {
    logger.warn(`[findBySessionUserId] 세션 또는 암호화된 사용자 ID 없음`);

    return null;
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
        logger.info(`[findBySessionUserId] 종료`);

        return user;
      }
    } catch (error: any) {
      logger.warn(`[resolveAuthenticatedUser] 복호화 실패: ${error.message}`);
    }
  }

  logger.warn(`[resolveAuthenticatedUser] 세션 복호화 실패 또는 일치하는 사용자 없음`);
  logger.info(`[findBySessionUserId] 종료`);

  return null;
};

/**
 * 문의 게시글의 작성자 닉네임을 반환합니다.
 *
 * @param {Inquiry} inquiry - 작성자 정보를 포함한 문의 게시글 객체
 * @returns {string} 작성자의 닉네임 (회원 또는 비회원)
 *
 * @throws {Error} 작성자 정보가 존재하지 않을 경우 예외를 발생시킵니다.
 *
 * @description
 * - 회원이 작성한 경우: `inquiry.user.nickName`을 반환합니다.
 * - 비회원이 작성한 경우: `inquiry.guestNickName`을 반환합니다.
 * - 둘 다 존재하지 않는 경우 예외를 발생시킵니다.
 *
 * @example
 * const writer = getInquiryWriter(inquiry);
 * console.log(`작성자: ${writer}`);
 */
export const findInquiryWriter = (inquiry: Inquiry): string => {
  if (inquiry.user?.nickName != null) {
    return inquiry.user?.nickName;
  } else if (inquiry.guestNickName) {
    return inquiry.guestNickName;
  } else {
    throw new Error('데이터 베이스에 문의 게시글 작성자 정보가 없는 문제 발생');
  }
};
