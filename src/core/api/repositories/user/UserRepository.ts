import { User } from '../../../models/entities/User';

/**
 * User 엔티티의 저장 기능을 정의하는 저장소 인터페이스입니다.
 *
 * 이 인터페이스는 커스텀 저장소 구현 시 필요한 메서드 시그니처를 정의하며,
 * 도메인 계층에서 의존성을 분리하기 위해 사용됩니다.
 *
 * 주요 기능:
 * - save: User 엔티티를 저장하고 해당 엔티티의 ID를 반환
 * - findByEmail: 회원 Email 데이터베이스에서 조회
 *
 * 주의사항:
 * - 실제 저장소 구현체는 TypeORM 또는 In-Memory 방식일 수 있으며, 의존성 주입 등을 통해 구현됩니다.
 */
export interface UserRepository {
  /**
   * User 엔티티를 저장합니다.
   *
   * @param user 저장할 User 인스턴스
   * @returns 저장된 User 엔티티의 ID (Primary Key)
   *
   * @throws Error 저장 과정에서 데이터베이스 오류가 발생할 경우
   */
  save(user: User): Promise<number>;

  /**
   * 주어진 email 에 해당하는 회원 정보를 조회합니다.
   *
   * 이 메서드는 `email` 기반으로 데이터베이스에서 해당 회원 정보를 검색합니다.
   *
   * @param email - 조회할 회원 Email
   * @returns 조회된 Inquiry 엔티티 또는 존재하지 않을 경우 null
   *
   * 주의사항:
   * - 삭제되었거나 존재하지 않는 Email의 경우 null이 반환됩니다.
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * 주어진 nickname 에 해당하는 회원 정보를 조회합니다.
   *
   * 이 메서드는 `nickname` 기반으로 데이터베이스에서 해당 회원 정보를 검색합니다.
   *
   * @param nickname - 조회할 회원 닉네임
   * @returns 조회된 Inquiry 엔티티 또는 존재하지 않을 경우 null
   *
   * 주의사항:
   * - 삭제되었거나 존재하지 않는 닉네임의 경우 null이 반환됩니다.
   */
  findByNickname(nickname: string): Promise<User | null>;
}
