import crypto from 'crypto';
import { logger } from './Logger';
import path from 'node:path';
import fs from 'node:fs';
import { makeDirectory } from './Generater';

/**
 * AES-GCM 알고리즘에서 사용할 IV 길이 (bytes 단위).
 * 일반적으로 AES-GCM 에서는 12바이트(96비트)를 권장합니다.
 */
export const IV_LENGTH = 12;

const COMMON_ENCRYPT_CACHE_FILE_DIRECTORY_PATH: string = path.resolve(
  __dirname,
  '../../../../apps/backend-core/storage/encrypt'
);

const COMMON_ENCRYPT_CACHE_FILE: string = path.resolve(
  __dirname,
  '../../../../apps/backend-core/storage/encrypt/common-salt-base.json'
);

const COMMON_ENCRYPT_CACHE_LOCK_FILE: string = path.resolve(
  __dirname,
  '../../../../apps/backend-core/storage/encrypt/common-salt-base.lock'
);

const COMMON_ENCRYPT_CACHE_INITIALIZATION_FLAG_FILE: string = path.resolve(
  __dirname,
  '../../../../apps/backend-core/storage/encrypt/common-salt-base-initialized'
);

let key: Buffer | null = null;
let iv: Buffer | null = null;

/**
 * 주어진 시간(ms)만큼 비동기 대기합니다.
 *
 * @param {number} ms - 대기할 시간(ms)
 * @returns {Promise<void>}
 */
const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 특정 파일이 주어진 시간 동안 존재할 때까지 주기적으로 확인하며 대기합니다.
 *
 * @param {string} filePath - 존재 여부를 확인할 파일의 절대 경로
 * @param {number} [timeout=3000] - 최대 대기 시간(ms). 기본값은 3000ms
 *
 * @returns {Promise<boolean>} 파일이 시간 내 생성되면 `true`, 그렇지 않으면 `false` 반환
 *
 * @description
 * - 지정된 경로에 파일이 생길 때까지 100ms 간격으로 존재 여부를 확인합니다.
 * - 대기 중에는 경과 시간과 상태를 로그로 출력합니다.
 * - 지정된 시간(`timeout`)이 초과되면 실패로 간주하고 `false`를 반환합니다.
 * - `LOCK` 파일 등 외부에서 생성되는 동기화 파일을 기다릴 때 유용합니다.
 *
 * @example
 * const ready = await waitUntilFileExists('/tmp/lockfile', 5000);
 * if (!ready) {
 *   throw new Error('lockfile 생성 타임아웃');
 * }
 */
const waitUntilFileExists = async (filePath: string, timeout = 3000): Promise<boolean> => {
  const start = Date.now();

  logger.info(
    `[waitUntilFileExists] ${path.basename(filePath)} 파일이 생성될 때까지 최대 ${timeout}ms 기다립니다.`
  );

  while (!fs.existsSync(filePath)) {
    const elapsed = Date.now() - start;

    logger.info(`[waitUntilFileExists] 대기 중... ${elapsed}ms 경과`);

    if (elapsed > timeout) {
      logger.error(
        `[waitUntilFileExists] ${timeout}ms 안에 ${path.basename(filePath)} 파일이 생성되지 않았습니다. 실패 처리합니다.`
      );
      return false;
    }

    await wait(100);
  }

  logger.info(`[waitUntilFileExists] ${path.basename(filePath)} 파일이 생성되어 대기 종료합니다.`);
  return true;
};

/**
 * 서버 전체에서 공통적으로 사용할 AES-256-GCM 용 Key 및 IV를 초기화합니다.
 *
 * @param {string} serverName - 현재 서버의 이름 (예: 'backend-core')
 * @param {string} serverEnvironment - 실행 중인 서버 환경 (예: 'development', 'production')
 *
 * @returns {Promise<void>} Key와 IV 초기화가 완료되면 반환됩니다.
 *
 * @throws {Error} saltBase 파일이 지정된 시간(기본 3초) 내에 생성되지 못한 경우 예외를 발생시킵니다.
 *
 * @description
 * - 서버 시작 시 한 번만 실행되어야 하며, 여러 인스턴스가 동시에 실행되는 상황에서도 동기화 처리가 이루어집니다.
 * - saltBase는 `common-salt-base.json`에 캐시되며, 존재하지 않을 경우 `LOCK` 파일을 생성해 다른 인스턴스의 동시 접근을 차단합니다.
 * - `saltBase`를 기반으로 `SHA-256` 해시를 생성하고, 해당 해시로부터 `Key`와 앞의 12바이트를 잘라 `IV`를 생성합니다.
 * - 서버 간 동기화를 위해 플래그 파일과 잠금 파일을 사용하며, 중복 생성을 방지합니다.
 *
 * @example
 * await initializeEncryptCommonKeyAndIV('backend-core', 'production');
 */
export const initializeEncryptCommonKeyAndIV = async (
  serverName: string,
  serverEnvironment: string
): Promise<void> => {
  logger.info(
    `${serverName} 의 ${serverEnvironment} 환경에서 사용될 암/복호화 Key와 IV 초기화 및 생성을 시작합니다.`
  );

  logger.info(`최초 File 들을 저장할 Directory 가 존재하는지 확인하겠습니다.`);

  makeDirectory(COMMON_ENCRYPT_CACHE_FILE_DIRECTORY_PATH);

  logger.info(`${serverName} 의 ${serverEnvironment} 환경에서 saltBase 값 생성 하겠습니다.`);

  if (!fs.existsSync(COMMON_ENCRYPT_CACHE_INITIALIZATION_FLAG_FILE)) {
    if (fs.existsSync(COMMON_ENCRYPT_CACHE_FILE)) {
      fs.unlinkSync(COMMON_ENCRYPT_CACHE_FILE);
      logger.warn(`[${serverName}] 기존 saltBase 캐시 파일 삭제했습니다.`);
    }

    if (fs.existsSync(COMMON_ENCRYPT_CACHE_LOCK_FILE)) {
      fs.unlinkSync(COMMON_ENCRYPT_CACHE_LOCK_FILE);
      logger.warn(`[${serverName}] 기존 LOCK 파일도 삭제했습니다.`);
    }

    fs.writeFileSync(COMMON_ENCRYPT_CACHE_INITIALIZATION_FLAG_FILE, 'DONE');
    logger.info(`[${serverName}] 초기화 플래그 생성 완료. 이 서버에서 최초 실행입니다.`);
  }

  let saltBase: string;

  if (fs.existsSync(COMMON_ENCRYPT_CACHE_FILE)) {
    saltBase = JSON.parse(fs.readFileSync(COMMON_ENCRYPT_CACHE_FILE, 'utf8')).saltBase;
    logger.info(`[${serverName}] 이미 생성된 saltBase 캐시 파일을 불러옵니다.`);
  } else {
    logger.info(
      `[${serverName}] saltBase 캐시 파일이 없네요. 다른 앱에서 만들고 있을 수 있습니다.`
    );

    if (fs.existsSync(COMMON_ENCRYPT_CACHE_LOCK_FILE)) {
      logger.info(`[${serverName}] LOCK 파일 발견됨 → 다른 앱에서 생성 중. 기다립니다.`);
      const success = await waitUntilFileExists(COMMON_ENCRYPT_CACHE_FILE);

      if (!success) {
        throw new Error(`[${serverName}] saltBase 를 만들기 위해 기다렸지만 Timeout 발생`);
      }

      saltBase = JSON.parse(fs.readFileSync(COMMON_ENCRYPT_CACHE_FILE, 'utf8')).saltBase;

      logger.info(`[${serverName}] saltBase 파일 생성 완료. 잘 불러왔습니다.`);
    } else {
      logger.info(`[${serverName}] LOCK 파일 없음. saltBase 캐시 파일 만들겠습니다.`);

      fs.writeFileSync(COMMON_ENCRYPT_CACHE_LOCK_FILE, 'LOCK');
      logger.info(`[${serverName}] LOCK 파일 생성 완료`);

      saltBase = crypto.randomBytes(32).toString('hex');

      fs.writeFileSync(COMMON_ENCRYPT_CACHE_FILE, JSON.stringify({ saltBase }), 'utf-8');
      logger.info(`[${serverName}] 새 saltBase 생성 완료 및 저장: ${saltBase}`);

      fs.unlinkSync(COMMON_ENCRYPT_CACHE_LOCK_FILE);
      logger.info(`[${serverName}] LOCK 파일 제거 완료`);
    }
  }

  key = crypto
    .createHash('sha256')
    .update(saltBase + 'key')
    .digest();

  iv = crypto
    .createHash('sha256')
    .update(saltBase + 'key')
    .digest()
    .subarray(0, IV_LENGTH);

  logger.info(
    `${serverName} 의 ${serverEnvironment} 환경에서 사용될 암/복호화 Key와 IV 초기화 및 생성을 완료하였습니다.`
  );
};

/**
 * 공통 Key 및 IV 값을 반환합니다.
 *
 * @returns {{ key: Buffer, iv: Buffer }} AES-256-GCM 암/복호화에 사용할 Key/IV 쌍
 *
 * @throws {Error} key 또는 iv가 초기화되지 않은 경우 예외 발생
 *
 * @description
 * - 반드시 `initializeEncryptCommonKeyAndIV`가 먼저 호출되어야 정상적으로 동작합니다.
 * - 초기화되지 않은 상태에서 호출 시 예외가 발생합니다.
 *
 * @example
 * const { key, iv } = getEncryptCommonKeyAndIV();
 */
export const getEncryptCommonKeyAndIV = (): { key: Buffer; iv: Buffer } => {
  if (!key || !iv) {
    throw new Error(
      '공통 암/복호화에 사용될 Key/IV가 초기화되지 않았습니다. 서버 시작 시 초기화해야 합니다.'
    );
  }

  return {
    key,
    iv,
  };
};
