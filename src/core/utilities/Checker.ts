import bcrypt from 'bcrypt';

/**
 * 입력된 평문 비밀번호와 해시된 비밀번호가 일치하는지 검증합니다.
 *
 * - bcrypt 라이브러리의 compare 함수를 사용하여,
 *   사용자가 입력한 평문 비밀번호와 DB에 저장된 해시된 비밀번호를 비교합니다.
 *
 * @param planPassword - 사용자가 입력한 평문 비밀번호
 * @param hashedPassword - DB에 저장된 해시된 비밀번호
 * @returns 비밀번호가 일치하면 true, 그렇지 않으면 false
 */
export const checkPassword = async (
  planPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(planPassword, hashedPassword);
};
