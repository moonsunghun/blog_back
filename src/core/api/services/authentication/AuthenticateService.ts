import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/DatabaseConfig';
import { User } from '../../../models/entities/User';
import { DefaultResponse } from '../../../constant/DefaultResponse';
import bcrypt from 'bcrypt';
import { HttpExceptionResponse } from '../../exception/HttpExceptionResponse';
import { UserRepository } from '../../repositories/user/UserRepository';
import { UserRepositoryImpl } from '../../repositories/implements/user/UserRepositoryImpl';
import { checkPassword } from '../../../utilities/Checker';
import { logger } from '../../../utilities/Logger';
import { UserRole } from '../../../types/Enum';
import { generateJwtToken } from '../../../utilities/JwtUtils';

export class AuthenticateService {
  private readonly userRepository: UserRepository = new UserRepositoryImpl();

  async registerUser(id: string, password: string, nickName: string) {
    const userRepository = AppDataSource.getRepository(User);

    // 이메일 중복 체크
    const existing = await userRepository.findOneBy({ email: id });
    if (existing) {
      return DefaultResponse.response(409, '이미 존재하는 이메일입니다.');
    }

    // 닉네임(별명) 중복 체크
    const nicknameExists = await userRepository.findOneBy({ nickName });
    if (nicknameExists) {
      return DefaultResponse.response(409, '이미 존재하는 닉네임입니다.');
    }

    // 회원 수 조회
    const userCount = await userRepository.count();
    const userType = userCount === 0 ? UserRole.ADMINISTRATOR : UserRole.USER;

    const hashed = await bcrypt.hash(password, 10);
    const user = userRepository.create({
      email: id,
      password: hashed,
      nickName: nickName,
      userType: userType,
    });
    await userRepository.save(user);

    // === 여기서 메시지 분기 ===
    const message =
      userType === UserRole.ADMINISTRATOR
        ? '회원가입 성공! 첫 번째 회원이므로 관리자 권한이 부여되었습니다.'
        : '회원가입 성공';

    return DefaultResponse.responseWithData(201, message, { userId: user.id });
  }

  /**
   * 사용자의 로그인 요청을 처리합니다.
   *
   * 이메일과 비밀번호를 검증한 후, JWT 토큰을 생성하여 반환합니다.
   * 'rememberMe' 설정 여부에 따라 토큰 만료 시간을 달리 설정합니다.
   *
   * @param {string} email - 사용자가 입력한 이메일
   * @param {string} password - 사용자가 입력한 비밀번호
   * @param {boolean} rememberMeStatus - '자동 로그인' 여부
   *
   * @returns {Promise<DefaultResponse<{token: string}>>} 로그인 성공 여부와 JWT 토큰을 포함한 응답
   *
   * @throws {HttpExceptionResponse} 이메일, 비밀번호 오류 시
   */
  async login(
    email: string,
    password: string,
    rememberMeStatus: boolean
  ): Promise<DefaultResponse<{ token: string }>> {
    if (!email || !password) {
      this.loginCommonExceptionHandler('이메일 또는 비밀번호 누락');
    }

    const loginUser: User | null = await this.userRepository.findByEmail(email);

    if (!loginUser) {
      this.loginCommonExceptionHandler('이메일 존재하지 않음');
    }

    if (!(await checkPassword(password, loginUser!.password))) {
      this.loginCommonExceptionHandler('비밀번호 불일치');
    }

    // 차단된 사용자 체크
    if (loginUser!.blockState) {
      this.loginCommonExceptionHandler('차단된 사용자');
    }

    // JWT 토큰 생성
    const expiresIn = rememberMeStatus ? '30d' : '24h';
    const token = generateJwtToken(loginUser!, expiresIn);

    logger.info(`[login] JWT 토큰 생성 완료 - 사용자 ID: ${loginUser!.id}`);

    return DefaultResponse.responseWithData(200, '로그인 성공', { token });
  }

  /**
   * 사용자의 로그아웃을 처리합니다.
   *
   * JWT 기반 인증에서는 서버 측에서 토큰을 무효화할 수 없으므로,
   * 클라이언트에서 토큰을 삭제하도록 안내합니다.
   *
   * @returns {Promise<DefaultResponse<void>>} 로그아웃 처리 결과
   *
   * @description
   * - JWT는 stateless이므로 서버에서 토큰을 무효화할 수 없습니다.
   * - 클라이언트에서 토큰을 삭제하도록 안내합니다.
   * - 향후 토큰 블랙리스트 기능을 추가할 수 있습니다.
   *
   * @example
   * // 클라이언트 요청 예시
   * POST /api/authentication/logout
   *
   * 응답:
   * {
   *   "statusCode": 200,
   *   "message": "로그아웃 성공"
   * }
   */
  async logout(): Promise<DefaultResponse<void>> {
    try {
      logger.info(`[logout] 로그아웃 요청 처리`);

      // JWT는 stateless이므로 서버에서 토큰을 무효화할 수 없음
      // 클라이언트에서 토큰을 삭제하도록 안내
      return DefaultResponse.response(200, '로그아웃 성공');
    } catch (error: any) {
      logger.error(`logout 실패 - 실패 이유 ${error.message}`);
      return DefaultResponse.response(500, '로그아웃 처리 실패');
    }
  }

  /**
   * 로그인 실패 공통 예외 처리기
   *
   * 로그인 중 공통적으로 발생하는 실패 사유를 처리합니다.
   * 로그를 기록하고 클라이언트에게 일관된 에러 메시지를 전달합니다.
   *
   * @param {string} reason - 로그인 실패 사유 (로그 기록용)
   *
   * @throws {HttpExceptionResponse} 400 상태의 사용자 입력 에러
   */
  private loginCommonExceptionHandler(reason: string) {
    logger.warn(`[login] 로그인 실패 - 사유: ${reason}`);

    throw new HttpExceptionResponse(400, '로그인 정보 확인 필요');
  }
}
