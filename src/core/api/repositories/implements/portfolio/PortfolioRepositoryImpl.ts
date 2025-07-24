import { DeleteResult, Repository } from 'typeorm';
import { PortfolioRepository } from '../../portfolio/PortfolioRepository';
import { Portfolio } from '../../../../models/entities/portfolio/Portfolio';
import { AppDataSource } from '../../../../config/DatabaseConfig';

/**
 * PortfolioRepository 인터페이스의 실제 구현체입니다.
 *
 * TypeORM의 Repository를 사용하여 Portfolio 엔티티를 저장하며,
 * 데이터 소스는 AppDataSource로부터 주입받습니다.
 *
 * 주요 기능:
 * - save: Portfolio 엔티티를 저장하고 해당 엔티티의 ID를 반환
 * - findById: Portfolio 고유번호 데이터베이스에서 조회
 *
 * 주의사항:
 * - AppDataSource는 TypeORM의 DataSource 인스턴스로 사전에 초기화되어 있어야 합니다.
 * - 저장 실패 시 예외가 발생할 수 있으며, 별도 예외 처리는 포함되어 있지 않습니다.
 */
export class PortfolioRepositoryImpl implements PortfolioRepository {
  /** TypeORM의 Repository 인스턴스 (Portfolio 전용) */
  private readonly portfolioRepository: Repository<Portfolio>;

  /**
   * PortfolioRepositoryImpl 생성자입니다.
   * 내부에서 AppDataSource를 통해 Repository를 초기화합니다.
   */
  constructor() {
    this.portfolioRepository = AppDataSource.getRepository(Portfolio);
  }

  /**
   * Portfolio 엔티티를 저장하고, 저장된 엔티티의 ID를 반환합니다.
   *
   * @param portfolio 저장할 Portfolio 인스턴스
   * @returns 저장된 Portfolio의 ID
   * @throws Error 저장 도중 DB 오류가 발생할 경우
   */
  async save(portfolio: Portfolio): Promise<number> {
    const result: Portfolio = await this.portfolioRepository.save(portfolio);
    return result.id;
  }

  /**
   * 주어진 ID에 해당하는 포트폴리오를 조회합니다.
   *
   * 이 메서드는 `portfolioId`를 기반으로 데이터베이스에서 해당 포트폴리오를 검색합니다.
   *
   * @param portfolioId - 조회할 포트폴리오의 고유 ID
   * @returns 조회된 Portfolio 엔티티 또는 존재하지 않을 경우 null
   *
   * 주의사항:
   * - 삭제되었거나 존재하지 않는 ID의 경우 null이 반환됩니다.
   */
  async findById(portfolioId: number): Promise<Portfolio | null> {
    return await this.portfolioRepository.findOne({
      where: { id: portfolioId },
    });
  }

  /**
   * 전체 포트폴리오 개수를 조회합니다.
   *
   * 이 메서드는 데이터베이스에 저장된 모든 포트폴리오의 개수를 반환합니다.
   *
   * @returns 전체 포트폴리오 개수
   *
   * @throws Error 데이터베이스 조회 중 오류가 발생할 경우
   */
  async count(): Promise<number> {
    return await this.portfolioRepository.count();
  }

  /**
   * Portfolio 엔티티를 수정합니다.
   *
   * @param oldPortfolio 기존 Portfolio 인스턴스
   * @param newPortfolio 수정할 Portfolio 인스턴스
   * @returns 수정된 Portfolio 엔티티
   */
  async update(oldPortfolio: Portfolio, newPortfolio: Portfolio): Promise<Portfolio> {
    return await this.portfolioRepository.save(
      this.portfolioRepository.merge(oldPortfolio, newPortfolio)
    );
  }

  /**
   * 지정한 ID에 해당하는 포트폴리오를 데이터베이스에서 삭제합니다.
   *
   * 주요 기능:
   * - TypeORM의 `delete` 메서드를 사용하여 포트폴리오를 삭제합니다.
   *
   * @param portfolioId 삭제할 포트폴리오 ID
   * @returns 삭제된 포트폴리오의 ID
   * @throws Error 삭제 과정에서 데이터베이스 오류가 발생할 경우
   */
  async deleteById(id: number): Promise<number> {
    const deleteResult: DeleteResult = await this.portfolioRepository.delete({ id: id });

    if (deleteResult.affected && deleteResult.affected > 0) {
      return id;
    } else {
      throw new Error(`포트폴리오 ID ${id} 삭제 실패`);
    }
  }

  /**
   * 포트폴리오 목록을 페이징하여 조회합니다.
   *
   * 이 메서드는 TypeORM의 `findAndCount` 메서드를 사용하여
   * 페이징된 포트폴리오 목록과 전체 개수를 함께 조회합니다.
   *
   * @param offset 조회 시작 위치 (0부터 시작)
   * @param limit 조회할 데이터 개수
   * @param orderBy 정렬 방향 ('ASC' 또는 'DESC')
   * @returns [포트폴리오 목록, 전체 개수] 튜플
   *
   * @throws Error 데이터베이스 조회 중 오류가 발생할 경우
   */
  async findAllWithPaging(
    offset: number,
    limit: number,
    orderBy: string
  ): Promise<[Portfolio[], number]> {
    return await this.portfolioRepository.findAndCount({
      skip: offset,
      take: limit,
      order: {
        createDateTime: orderBy as 'ASC' | 'DESC',
      },
    });
  }

  /**
   * 메인 상태에 따라 포트폴리오 목록을 조회합니다.
   *
   * @param mainState 메인 상태 (true/false)
   * @returns 해당 메인 상태의 포트폴리오 목록
   *
   * @throws Error 데이터베이스 조회 중 오류가 발생할 경우
   */
  async findByMainState(mainState: boolean): Promise<Portfolio[]> {
    return await this.portfolioRepository.find({
      where: { mainState: mainState },
    });
  }
}
