import { Request, Response } from 'express';
import { CookieOptions } from '../types/Type';
import process from 'node:process';
import { encryptGuestPassword } from './Encyprter';
import { logger } from './Logger';
import { HttpExceptionResponse } from '../api/exception/HttpExceptionResponse';

/**
 * 비회원 비밀번호를 쿠키에 설정합니다.
 *
 * @param {Response} response - Express 응답 객체
 * @param {string} key - 쿠키 키 이름 (예: `guestPassword-1`)
 * @param {string} value - 쿠키에 저장할 값 (평문 또는 암호문)
 * @param {CookieOptions} [options] - 쿠키 옵션 (maxAge, httpOnly 등)
 *
 * @description
 * - 기본적으로 AES-GCM 방식으로 암호화된 값 저장 가능 (`encrypted: true`)
 * - `NODE_ENV`에 따라 `httpOnly`, `secure` 기본값이 자동 설정됩니다.
 *
 * @example
 * guestPasswordSetCookie(res, 'guestPassword-1', '1234', { encrypted: true });
 */
export const guestPasswordSetCookie = (
  response: Response,
  key: string,
  value: string,
  options: CookieOptions = {}
): void => {
  const {
    maxAge = 1000 * 60 * 60,
    httpOnly = process.env.NODE_ENV !== 'local',
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'lax',
    path = '/',
    encrypted = false,
  } = options;

  const finalValue: string = encrypted ? encryptGuestPassword(value) : value;

  response.cookie(key, finalValue, {
    maxAge,
    httpOnly,
    secure,
    sameSite,
    path,
  });
};

/**
 * 비회원 비밀번호 쿠키가 존재하는지 확인하고 해당 값을 반환합니다.
 *
 * @param {Request} request - Express 요청 객체
 * @param {number} inquiryId - 문의 ID (쿠키 이름을 식별하는 데 사용)
 * @returns {Promise<string>} 쿠키에서 가져온 비회원 비밀번호 (암호화된 문자열)
 *
 * @throws {Error} 쿠키가 존재하지 않으면 예외 발생
 *
 * @example
 * const guestPassword = await validateGuestPasswordCookie(req, 1);
 */
export const validateGuestPasswordCookie = async (
  request: Request,
  inquiryId: number
): Promise<string> => {
  logger.info(`[validateGuestPasswordCookie] 시작`);

  if (!request.cookies?.[`guestPassword-${inquiryId}`]) {
    logger.info(`[validateGuestPasswordCookie] 종료`);

    throw new HttpExceptionResponse(404, `비회원 비밀번호 쿠키가 존재하지 않음`);
  }

  logger.info(`[validateGuestPasswordCookie] 시작`);

  return request.cookies?.[`guestPassword-${inquiryId}`];
};
