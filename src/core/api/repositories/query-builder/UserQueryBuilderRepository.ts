import { Repository } from 'typeorm';
import { User } from '../../../models/entities/User';
import { UserSearchRequestDto } from '../../../models/dtos/request/user/UserSearchRequestDto';
/**
 * User 엔티티에 대한 커스텀 쿼리 빌더 레포지토리입니다.
 *
 * 이 객체는 TypeORM Repository에 동적으로 mixin 형식으로 주입되어 사용되며,
 * 게시글 검색 및 페이징 기능을 수행하는 메서드를 제공합니다.
 *
 * 주요 기능:
 * - 검색 조건: 제목, 작성자 닉네임, 답변 상태, 본문 내용
 * - 페이징 처리: limit 및 offset을 DTO에서 추출
 *
 * 주의사항:
 * - `this`는 반드시 `Repository<User>` 객체로 바인딩되어야 합니다.
 */
export const UserQueryBuilderRepository = {
  /**
   * UserSearchRequestDto에 따라 동적으로 조건을 적용한
   * 검색 및 페이징 쿼리를 실행합니다.
   *
   * @param userSearchRequestDto 검색 조건과 페이징 정보를 담은 DTO
   * @returns 조건에 맞는 게시글 목록과 전체 개수의 튜플
   *
   * @example
   * const [rows, total] = await userRepository.dynamicQuerySearchAndPagingByDto(dto);
   */
  dynamicQuerySearchAndPagingByDto(
    this: Repository<User>,
    userSearchRequestDto: UserSearchRequestDto
  ): Promise<[User[], number]> {
    const selectQueryBuilder = this.createQueryBuilder('user')
      .limit(userSearchRequestDto.getLimit())
      .offset(userSearchRequestDto.getOffset());

    if (userSearchRequestDto.email) {
      selectQueryBuilder.andWhere('user.email LIKE :email', {
        email: `%${userSearchRequestDto.email}%`,
      });
    }

    if (userSearchRequestDto.nickName) {
      selectQueryBuilder.andWhere('user.nickName LIKE :nickName', {
        nickName: `%${userSearchRequestDto.nickName}%`,
      });
    }

    if (userSearchRequestDto.blockState !== undefined) {
      selectQueryBuilder.andWhere('user.blockState = :blockState', {
        blockState: userSearchRequestDto.blockState,
      });
    }

    return selectQueryBuilder.getManyAndCount();
  },
};
