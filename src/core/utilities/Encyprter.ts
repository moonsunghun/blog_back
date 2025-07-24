import { User } from '../models/entities/User';
import { logger } from './Logger';
import crypto from 'crypto';
import { getEncryptCommonKeyAndIV, IV_LENGTH } from './EncyprtKeyManager';

/**
 * 사용자 정보를 기반으로 고유 ID를 AES-256-GCM 방식으로 암호화합니다.
 *
 * 이 함수는 `user.id`, `user.userType`을 포함하여 GCM 인증 태그와 함께 암호화된 데이터를
 * Base64로 인코딩하여 반환합니다.
 *
 * 포맷: `userId|userType|암호문|authTag` → Base64 인코딩 문자열
 *
 * @param {User} user - 암호화 대상 사용자 객체
 * @returns {string} Base64로 인코딩된 암호문 문자열
 *
 * @throws {Error} 사용자 정보가 누락되었거나 암호화 처리 중 오류가 발생한 경우
 */
export const encryptUserId = (user: User): string => {
  if (!user) {
    const errorMessage: string = `암호화할 User 정보 확인 필요`;
    logger.error(errorMessage);

    throw new Error(errorMessage);
  }

  const { key, iv } = generateUserEncryptKeyAndIV(user);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(user.id.toString(), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // 포맷: userId|userType|암호문|authTag
  const rawData = `${user.id}|${user.userType}|${encrypted.toString('base64')}|${authTag.toString('base64')}`;

  // base64로 묶어서 반환 (암호문 + 인증 태그)
  return Buffer.from(rawData).toString('base64');
};

/**
 * 비회원(guest)의 비밀번호를 AES-256-GCM 방식으로 암호화합니다.
 *
 * @param {string} guestPassword - 암호화할 비회원 비밀번호 문자열
 * @returns {string} 암호문:인증태그 형태의 문자열 (예: `encryptedHex:authTagHex`)
 *
 * @throws {Error} guestPassword가 비어있거나 공통 키/IV가 초기화되지 않았을 경우 예외 발생
 *
 * @description
 * - 서버 전역에서 초기화된 공통 키(Key)와 초기화 벡터(IV)를 사용하여 암호화를 수행합니다.
 * - 인증 태그(auth tag)는 GCM 모드의 무결성 검증을 위한 요소이며, 암호문과 함께 반환됩니다.
 * - 반환 형식은 `암호문(hex) + ':' + 인증 태그(hex)`입니다.
 *
 * @example
 * const encrypted = encryptGuestPassword('1234');
 * console.log(encrypted); // "d97fd8cf42d91fa3c27f3e7d:5a839b90a3b3421a89ee2ab4f802a4c5"
 */
export const encryptGuestPassword = (guestPassword: string): string => {
  if (!guestPassword) {
    const errorMessage: string = `암호화할 guest password 확인 필요`;

    logger.error(errorMessage);

    throw new Error(errorMessage);
  }

  const { key, iv } = getEncryptCommonKeyAndIV();

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(guestPassword, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${encrypted}:${authTag}`;
};

/**
 * 암호화된 사용자 고유 ID 문자열을 복호화하여 실제 ID와 사용자 유형을 반환합니다.
 *
 * 입력 포맷은 Base64로 인코딩된 문자열이며, 내부 구조는
 * `userId|userType|암호문|authTag`로 되어 있습니다.
 *
 * GCM 인증 태그를 포함하여 무결성을 확인하며 복호화를 수행합니다.
 *
 * @param {string} encryptedBase64 - 암호화된 사용자 ID 문자열 (Base64)
 * @param {User} user - 복호화에 필요한 사용자 정보 (ID, userType)
 * @returns {{ userId: number; userType: string }} 복호화된 사용자 정보 객체
 *
 * @throws {Error} 입력 포맷 오류, 복호화 키 불일치, 인증 실패 등 복호화 중 문제 발생 시
 */
export const decryptUserByEncryptedUserId = (
  encryptedBase64: string,
  user: User
): { userId: number; userType: string } => {
  if (!encryptedBase64) {
    const errorMessage: string = `복호화할 User 고유번호 확인 필요`;

    logger.error(errorMessage);

    throw new Error(errorMessage);
  }

  if (!user) {
    const errorMessage: string = `회원 번호 복호화 작업 중 회원 정보 문제 발생`;

    logger.error(errorMessage);

    throw new Error(errorMessage);
  }
  const decoded: string = Buffer.from(encryptedBase64, 'base64').toString('utf8');
  const [userIdString, userType, encryptedData, authTagData] = decoded.split('|');

  if (!userIdString || !userType || !encryptedData || !authTagData) {
    throw new Error('복호화 대상 포맷 오류');
  }

  const { key, iv } = generateUserEncryptKeyAndIV(user);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(Buffer.from(authTagData, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, 'base64')),
    decipher.final(),
  ]);

  const decryptedId: number = Number(decrypted.toString('utf8'));

  if (decryptedId.toString() !== userIdString) {
    throw new Error('복호화된 ID가 원본과 불일치');
  }

  return {
    userId: decryptedId,
    userType,
  };
};

/**
 * 비회원(guest)의 암호화된 비밀번호를 복호화합니다.
 *
 * @param {string} encryptGuestPassword - 암호문과 인증 태그를 포함한 문자열 (형식: `encryptedHex:authTagHex`)
 * @returns {string} 복호화된 원본 비밀번호 문자열
 *
 * @throws {Error} 입력값이 없거나 형식이 잘못되었거나, 복호화에 실패할 경우 예외 발생
 *
 * @description
 * - 암호문과 인증 태그는 콜론(`:`)으로 구분되어야 합니다.
 * - 서버 시작 시 초기화된 공통 AES-256-GCM 키/IV를 사용하여 복호화합니다.
 * - 인증 태그(auth tag)를 검증하여 데이터 무결성을 확인합니다.
 *
 * @example
 * const original = decryptGuestPassword('d97fd8cf42d91fa3c27f3e7d:5a839b90a3b3421a89ee2ab4f802a4c5');
 * console.log(original); // '1234'
 */
export const decryptGuestPassword = (encryptGuestPassword: string): string => {
  if (!encryptGuestPassword) {
    const errorMessage: string = `비회원 임시 비밀번호 복호화 작업 중 회원 정보 문제 발생`;

    logger.error(errorMessage);

    throw new Error(errorMessage);
  }

  const { key, iv } = getEncryptCommonKeyAndIV();

  const [encrypted, authTag] = encryptGuestPassword.split(':');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
 * 사용자 정보를 기반으로 AES-256-GCM에 사용할 키(key)와 초기 벡터(iv)를 생성합니다.
 *
 * salt는 `user.userType-user.id`를 기반으로 구성되며,
 * SHA-256 해시로부터 키와 IV를 파생합니다.
 *
 * @param {User} user - 암호화 키 생성을 위한 사용자 객체
 * @returns {{ key: Buffer; iv: Buffer }} 생성된 키와 IV 버퍼 객체
 *
 * @throws {Error} 사용자 정보가 누락된 경우
 */
const generateUserEncryptKeyAndIV = (user: User): { key: Buffer; iv: Buffer } => {
  if (!user) {
    const errorMessage: string = `암호화할 User 정보 확인 필요`;
    logger.error(errorMessage);

    throw new Error(errorMessage);
  }

  const saltBase = `${user.userType}-${user.id}`;
  const key = crypto
    .createHash('sha256')
    .update(saltBase + 'key')
    .digest();
  const iv = crypto
    .createHash('sha256')
    .update(saltBase + 'iv')
    .digest()
    .subarray(0, IV_LENGTH);

  return { key, iv };
};
