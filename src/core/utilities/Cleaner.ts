import path from 'node:path';
import fsPromises from 'fs/promises';
import fs from 'node:fs';
import { logger } from './Logger';

/**
 * 비동기 방식으로 파일을 삭제합니다.
 *
 * 이 함수는 파일 경로를 받아 해당 경로의 파일을 삭제합니다.
 * 삭제 성공 여부를 boolean으로 반환하며, 삭제 중 오류가 발생하면 로그로 출력합니다.
 *
 * @param filePath 삭제할 파일의 경로
 * @returns 삭제 성공 시 true, 실패 시 false
 * @throws Error 파일 경로가 주어지지 않은 경우
 */
export const fileCleanerAsync = async (filePath: string): Promise<boolean> => {
  if (!filePath) {
    throw new Error('파일 저장 정보 확인 필요');
  }

  const resolvedPath = path.resolve(filePath);

  try {
    await fsPromises.unlink(resolvedPath);

    logger.info(`파일 삭제 비동기 처리 완료: ${resolvedPath}`);

    return true;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      logger.error(`파일 삭제 비동기 처리 실패 - 실패 이유: 파일 존재 하지 않음: ${resolvedPath}`);
    } else {
      logger.error(
        `파일 삭제 비동기 처리 실패 - 실패 이유: 알 수 없는 오류 발생: ${error.message}`
      );
    }

    return false;
  }
};

/**
 * 동기 방식으로 파일을 삭제합니다.
 *
 * 이 함수는 파일 경로를 받아 해당 경로의 파일을 삭제하며, 삭제 결과를 boolean으로 반환합니다.
 * 예외 발생 시 로그를 출력하며, 존재하지 않는 파일도 예외로 처리됩니다.
 *
 * @param filePath 삭제할 파일의 경로
 * @returns 삭제 성공 시 true, 실패 시 false
 * @throws Error 파일 경로가 주어지지 않은 경우
 */
export const fileCleanerSync = (filePath: string): boolean => {
  if (!filePath) {
    throw new Error('파일 저장 정보 확인 필요');
  }

  const resolvedPath = path.resolve(filePath);

  try {
    fs.unlinkSync(resolvedPath);

    logger.info(`파일 삭제 동기 처리 완료: ${resolvedPath}`);

    return true;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      logger.error(`파일 삭제 동기 처리 실패 - 실패 이유: 파일 존재 하지 않음: ${resolvedPath}`);
    } else {
      logger.error(`파일 삭제 동기 처리 실패 - 실패 이유: 알 수 없는 오류 발생:${error.message}`);
    }

    return false;
  }
};
