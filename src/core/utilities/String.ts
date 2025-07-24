import { logger } from './Logger';

export const shuffleString = (target: string) => {
  if (!target) {
    const errorMessage = '문자열을 섞기 위한 target 매개 변수 값 확인 필요.';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  return target
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};
