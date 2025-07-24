import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/DatabaseConfig';
import { User } from '../../../models/entities/User';
import { DefaultResponse } from '../../../constant/DefaultResponse';
import bcrypt from 'bcrypt';
import { HttpExceptionResponse } from '../../exception/HttpExceptionResponse';
import { UserRepository } from '../../repositories/user/UserRepository';
import { UserRepositoryImpl } from '../../repositories/implements/user/UserRepositoryImpl';
import { checkPassword } from '../../../utilities/Checker';
import { encryptUserId } from '../../../utilities/Encyprter';
import { logger } from '../../../utilities/Logger';
import process from 'node:process';
import { UserRole } from '../../../types/Enum'; // enum import 필요

// Express Session 확장 인터페이스
interface ExtendedSessionData {
  encryptedUserId?: string;
  rememberMeStatus?: boolean;
  user?: {
    id: number;
    username: string;
    nickname: string;
    role: UserRole;
  };
}

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
   * 이메일과 비밀번호를 검증한 후, 세션에 암호화된 사용자 고유 ID를 저장합니다.
   * 'rememberMe' 설정 여부에 따라 세션 유지 시간을 달리 설정하며,
   * 세션 저장에 실패할 경우 에러를 반환합니다.
   *
   * @param {Request} request - Express 요청 객체 (세션 포함)
   * @param {string} email - 사용자가 입력한 이메일
   * @param {string} password - 사용자가 입력한 비밀번호
   * @param {boolean} rememberMeStatus - '자동 로그인' 여부
   *
   * @returns {Promise<DefaultResponse<void>>} 로그인 성공 여부를 나타내는 응답
   *
   * @throws {HttpExceptionResponse} 이메일, 비밀번호 오류 또는 세션 저장 실패 시
   */
  async login(
    request: Request,
    email: string,
    password: string,
    rememberMeStatus: boolean
  ): Promise<DefaultResponse<void>> {
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

    const encryptedId: string | null = encryptUserId(loginUser!);

    if (!encryptedId) {
      logger.error(`인증 처리 중 사용자 고유 번호 암호화 처리 간 문제 발생`);

      return Promise.reject(new HttpExceptionResponse(500, '인증 처리 중 서버 문제 발생'));
    }

    logger.info(`[login] encryptedId: ${encryptedId}`);
    logger.info(`[login] session before save: ${JSON.stringify(request.session)}`);

    const sessionData = request.session as ExtendedSessionData;
    sessionData.encryptedUserId = encryptedId;
    request.session.cookie.maxAge = this.generateCookieMaxAge(rememberMeStatus);

    logger.info(`[login] session after save: ${JSON.stringify(request.session)}`);
    logger.info(`[login] session after save cookie: ${JSON.stringify(request.session.cookie)}`);

    return new Promise((resolve, reject) => {
      request.session.save((error: any) => {
        if (error) {
          logger.error(`login session 저장 실패 - 실패 이유 ${error.message}`);

          return reject(new HttpExceptionResponse(500, `로그인 실패`));
        }

        resolve(DefaultResponse.response(200, '로그인 성공'));
      });
    });
  }

  /**
   * 사용자의 세션을 제거하고 로그아웃을 처리합니다.
   *
   * @param {Request} request - Express 요청 객체
   * @param {Response} response - Express 응답 객체
   * @returns {Promise<DefaultResponse<void>>} 로그아웃 처리 결과
   *
   * @description
   * - 현재 세션을 `destroy`하여 세션 정보를 제거합니다.
   * - 클라이언트 측 세션 쿠키(`connect.sid`)를 삭제합니다.
   * - 에러 발생 시 500 상태 코드와 함께 처리 실패 메시지를 반환합니다.
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
  async logout(request: Request, response: Response): Promise<DefaultResponse<void>> {
    try {
      logger.info(`[logout] 로그아웃 요청 - sessionId: ${request.session.id}`);

      return new Promise((resolve, reject) => {
        request.session.destroy((error: any) => {
          if (error) {
            logger.error(`logout 실패 - 실패 이유 ${error.message}`);

            return reject(new HttpExceptionResponse(500, `로그아웃 실패`));
          }

          response.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'production' ? false : true,
            sameSite: 'lax',
          });

          resolve(DefaultResponse.response(200, '로그아웃 성공'));
        });
      });
    } catch (error: any) {
      logger.error(`logout 실패 - 실패 이유 ${error.message}`);

      return DefaultResponse.response(500, '로그아웃 처리 실패');
    }
  }

  /**
   * 세션 쿠키의 만료 시간을 생성합니다.
   *
   * 'rememberMe' 상태에 따라 30일 또는 1일로 쿠키의 `maxAge` 값을 설정합니다.
   *
   * @param {boolean} rememberMeStatus - 자동 로그인 여부
   * @returns {number} 쿠키 만료 시간 (밀리초 단위)
   */
  private generateCookieMaxAge(rememberMeStatus: boolean): number {
    rememberMeStatus ??= false;

    logger.info(`generateCookieMaxAge - rememberMeStatus: ${rememberMeStatus}`);

    if (rememberMeStatus) {
      return 1000 * 60 * 60 * 24 * 30;
    } else {
      return 1000 * 60 * 60 * 24;
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
