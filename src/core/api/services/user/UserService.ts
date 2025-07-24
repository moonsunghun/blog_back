import { AppDataSource } from '../../../config/DatabaseConfig';
import { User } from '../../../models/entities/User';
import { DefaultResponse } from '../../../constant/DefaultResponse';
import { UserPasswordUpdateRequestDto } from '../../../models/dtos/request/user/UserPasswordUpdateRequestDto';
import { UserProfileResponseDto } from '../../../models/dtos/response/user/UserProfileResponseDto';
import bcrypt from 'bcrypt';
import { HttpExceptionResponse } from '../../exception/HttpExceptionResponse';
import { UserListResponseDto } from '../../../models/dtos/response/user/UserListResponseDto';
import { Page } from '../../../constant/Page';
import { UserSearchRequestDto } from '../../../models/dtos/request/user/UserSearchRequestDto';
import { UserQueryBuilderRepository } from '../../repositories/query-builder/UserQueryBuilderRepository';
import { UserNickNameUpdateRequestDto } from '../../../models/dtos/request/user/UserNicknameUpdateRequestDto';

/**
 * 사용자 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 */
export class UserService {
  private readonly userQueryBuilderRepository = AppDataSource.getRepository(User).extend(
    UserQueryBuilderRepository
  );

  /**
   * 마이페이지 정보를 조회합니다.
   *
   * @param {number} userId - 조회할 사용자의 ID
   * @returns {Promise<DefaultResponse<UserProfileResponseDto>>} 사용자의 이메일과 별명 정보
   */
  async getUserMyPageInfo(userId: number): Promise<DefaultResponse<UserProfileResponseDto>> {
    const userRepository = AppDataSource.getRepository(User);

    if (!userId) {
      return Promise.reject(new HttpExceptionResponse(400, '로그인을 다시 시도해 주세요.'));
    }

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return Promise.reject(new HttpExceptionResponse(404, '사용자를 찾을 수 없습니다.'));
    }

    const responseDto = new UserProfileResponseDto(user.email, user.nickName);
    return DefaultResponse.responseWithData(200, '마이페이지 정보 조회 성공', responseDto);
  }

  /**
   * 사용자의 별명을 수정합니다.
   * 중복 검사와 비속어 필터링을 수행합니다.
   *
   * @param {number} userId - 수정할 사용자의 ID
   * @param {UserNicknameUpdateRequestDto} requestDto - 별명 수정 요청 DTO
   * @returns {Promise<DefaultResponse<any>>} 수정 결과
   */
  async updateNickName(
    userId: number,
    requestDto: UserNickNameUpdateRequestDto
  ): Promise<DefaultResponse<any>> {
    const userRepository = AppDataSource.getRepository(User);

    if (!userId) {
      return Promise.reject(new HttpExceptionResponse(400, '잘못된 사용자 ID입니다.'));
    }

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return Promise.reject(new HttpExceptionResponse(404, '사용자를 찾을 수 없습니다.'));
    }

    const { nickName } = requestDto;

    // 별명 중복 체크
    const nicknameExists = await userRepository.findOneBy({ nickName: nickName });
    if (nicknameExists && nicknameExists.id !== userId) {
      return Promise.reject(new HttpExceptionResponse(409, '이미 사용 중인 별명입니다.'));
    }

    user.nickName = nickName;
    await userRepository.save(user);

    return DefaultResponse.response(200, '별명이 성공적으로 수정되었습니다.');
  }

  /**
   * 사용자의 비밀번호를 수정합니다.
   * 현재 비밀번호 확인 후 새 비밀번호로 변경합니다.
   *
   * @param {number} userId - 수정할 사용자의 ID
   * @param {UserPasswordUpdateRequestDto} requestDto - 비밀번호 수정 요청 DTO
   * @returns {Promise<DefaultResponse<any>>} 수정 결과
   */
  async updatePassword(
    userId: number,
    requestDto: UserPasswordUpdateRequestDto
  ): Promise<DefaultResponse<any>> {
    const userRepository = AppDataSource.getRepository(User);

    if (!userId) {
      return Promise.reject(new HttpExceptionResponse(400, '잘못된 사용자 ID입니다.'));
    }

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return Promise.reject(new HttpExceptionResponse(404, '사용자를 찾을 수 없습니다.'));
    }

    const { currentPassword, newPassword } = requestDto;

    // 현재 비밀번호 확인
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return Promise.reject(new HttpExceptionResponse(400, '현재 비밀번호가 일치하지 않습니다.'));
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await userRepository.save(user);

    return DefaultResponse.response(200, '비밀번호가 성공적으로 수정되었습니다.');
  }

  /**
   * 사용자 계정을 탈퇴합니다.
   * 현재 비밀번호 확인 후 계정을 삭제합니다.
   *
   * @param {number} userId - 탈퇴할 사용자의 ID
   * @param {UserWithdrawRequestDto} requestDto - 회원 탈퇴 요청 DTO
   * @returns {Promise<DefaultResponse<any>>} 탈퇴 결과
   */
  async deleteUser(userId: number): Promise<DefaultResponse<any>> {
    const userRepository = AppDataSource.getRepository(User);

    if (!userId) {
      return Promise.reject(new HttpExceptionResponse(500, `잘못된 사용자 ID 입니다.`));
    }

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return Promise.reject(new HttpExceptionResponse(404, '사용자를 찾을 수 없습니다.'));
    }

    // 사용자 계정 삭제
    await userRepository.remove(user);

    return DefaultResponse.responseWithData(200, '회원 탈퇴가 완료되었습니다.', {});
  }

  /**
   * 조건 기반으로 문의 목록을 조회합니다.
   *
   * @param userSearchRequestDto 검색 조건 및 페이징 정보가 포함된 DTO
   * @returns 조회된 목록과 페이징 정보를 포함한 DefaultResponse
   */
  async getUserListWithSearch(
    userSearchRequestDto: UserSearchRequestDto
  ): Promise<DefaultResponse<UserListResponseDto>> {
    const results: [User[], number] =
      await this.userQueryBuilderRepository.dynamicQuerySearchAndPagingByDto(userSearchRequestDto);

    return DefaultResponse.responseWithPaginationAndData(
      200,
      '회원 목록 조회 성공',
      new Page<UserListResponseDto>(
        userSearchRequestDto.pageNumber,
        userSearchRequestDto.perPageSize,
        results[1],
        results[0].map((user: User): UserListResponseDto => new UserListResponseDto(user))
      )
    );
  }
}
