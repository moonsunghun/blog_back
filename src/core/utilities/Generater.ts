import { v4 as uuidV4 } from 'uuid';
import fs from 'node:fs';
import { logger } from './Logger';

/**
 * 비회원 닉네임 생성을 위한 UUID 기반 문자열 생성 함수입니다.
 *
 * @returns {string} 생성된 비회원 닉네임 식별용 4자리 UUID 문자열
 *
 * @description
 * - 문의글 또는 댓글 작성 시 비회원 닉네임 등록을 위한 식별자입니다.
 * - 전체 UUID 중 앞 4자리만 잘라내어 간결한 식별 문자열을 제공합니다.
 *
 * @example
 * const guestNickName = generatedGuestNickNameUuid(); // 예: 'f4a1'
 */
export const generatedGuestNickNameUuid = (): string => {
  return uuidV4().slice(0, 4);
};

/**
 * 지정된 경로에 디렉터리가 존재하지 않으면 생성합니다.
 *
 * @param {string} directoryPath - 생성할 디렉터리의 절대 경로 또는 상대 경로
 *
 * @description
 * - 해당 경로가 존재하지 않을 경우, 재귀적으로 디렉터리를 생성합니다.
 * - 이미 존재하는 경우 아무 작업도 수행하지 않습니다.
 * - 생성 여부 및 경과는 로거를 통해 기록됩니다.
 *
 * @example
 * makeDirectory('./uploads/images');
 */
export const makeDirectory = (directoryPath: string) => {
  if (!fs.existsSync(directoryPath)) {
    logger.info(`Directory 가 존재하지 않아 생성하겠습니다.`);

    fs.mkdirSync(directoryPath, {
      recursive: true,
    });

    logger.info(`디렉터리 생성 완료: ${directoryPath}`);
  }
};
