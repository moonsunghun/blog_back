import { Repository } from 'typeorm';
import { User } from '../../../../models/entities/User';
import { UserRepository } from '../../user/UserRepository';
import { AppDataSource } from '../../../../config/DatabaseConfig';

/**
 * UserRepository 인터페이스의 실제 구현체입니다.
 *
 * TypeORM의 Repository를 사용하여 User 엔티티를 저장하며,
 * 데이터 소스는 AppDataSource로부터 주입받습니다.
 *
 * 주요 기능:
 * - save: User 엔티티를 저장하고 해당 엔티티의 ID를 반환
 * - findByEmail: 회원 Email 데이터베이스에서 조회
 *
 * 주의사항:
 * - AppDataSource는 TypeORM의 DataSource 인스턴스로 사전에 초기화되어 있어야 합니다.
 * - 저장 실패 시 예외가 발생할 수 있으며, 별도 예외 처리는 포함되어 있지 않습니다.
 */
export class UserRepositoryImpl implements UserRepository {
  private readonly userRepository: Repository<User>;

  /**
   * UserRepositoryImpl 생성자입니다.
   * 내부에서 AppDataSource를 통해 Repository를 초기화합니다.
   */
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * User 엔티티를 저장합니다.
   *
   * @param user 저장할 User 인스턴스
   * @returns 저장된 User 엔티티의 ID (Primary Key)
   *
   * @throws Error 저장 과정에서 데이터베이스 오류가 발생할 경우
   */
  async save(user: User): Promise<number> {
    const result: User = await this.userRepository.save(user);
    return result.id;
  }

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
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
  }

  /**
   * 주어진 nickName 에 해당하는 회원 정보를 조회합니다.
   *
   * 이 메서드는 `nickName` 기반으로 데이터베이스에서 해당 회원 정보를 검색합니다.
   *
   * @param nickName - 조회할 회원 닉네임
   * @returns 조회된 User 엔티티 또는 존재하지 않을 경우 null
   *
   * 주의사항:
   * - 삭제되었거나 존재하지 않는 nickName의 경우 null이 반환됩니다.
   */
  async findByNickname(nickName: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        nickName: nickName,
      },
    });
  }
}
