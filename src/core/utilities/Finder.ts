import { Request } from 'express';
import { User } from '../models/entities/User';
import { Inquiry } from '../models/entities/Inquiry';
import { logger } from './Logger';
import { HttpExceptionResponse } from '../api/exception/HttpExceptionResponse';
import { AppDataSource } from '../config/DatabaseConfig';
import { Repository } from 'typeorm';

/**
 * JWT 토큰에서 사용자 정보를 가져와 작성자 닉네임을 반환합니다.
 *
 * @param {Request} request - Express 요청 객체 (JWT 토큰 포함)
 * @returns {Promise<string | undefined>} 사용자 닉네임 (없을 경우 undefined)
 */
export const findByWriter = async (
  request: Request
): Promise<string | undefined> => {
  if (!request.user) {
    return undefined;
  }

  const userRepository: Repository<User> = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({
    where: { id: request.user.id },
    select: ['nickName'],
  });

  return user?.nickName;
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
