import { Portfolio } from '../../../models/entities/portfolio/Portfolio';

/**
 * Portfolio 엔티티의 저장 기능을 정의하는 저장소 인터페이스입니다.
 *
 * 이 인터페이스는 커스텀 저장소 구현 시 필요한 메서드 시그니처를 정의하며,
 * 도메인 계층에서 의존성을 분리하기 위해 사용됩니다.
 *
 * 주요 기능:
 * - save: Portfolio 엔티티를 저장하고 해당 엔티티의 ID를 반환
 * - findById: Portfolio 고유번호 데이터베이스에서 조회
 * - delete: Portfolio 엔티티를 삭제
 *
 * 주의사항:
 * - 실제 저장소 구현체는 TypeORM 또는 In-Memory 방식일 수 있으며, 의존성 주입 등을 통해 구현됩니다.
 */
export interface PortfolioRepository {
  /**
   * Portfolio 엔티티를 저장합니다.
   *
   * @param portfolio 저장할 Portfolio 인스턴스
   * @returns 저장된 Portfolio 엔티티의 ID (Primary Key)
   *
   * @throws Error 저장 과정에서 데이터베이스 오류가 발생할 경우
   */
  save(portfolio: Portfolio): Promise<number>;

  /**
   * 조건에 맞는 포트폴리오 목록을 페이징하여 조회합니다.
   *
   * @param portfolioId 검색 조건과 페이징 정보가 포함된 DTO
   * @returns [포트폴리오 목록, 전체 개수] 튜플
   *
   * @throws Error 데이터베이스 조회 중 오류가 발생할 경우
   */
  findById(portfolioId: number): Promise<Portfolio | null>;

  /**
   * 포트폴리오 목록을 페이징하여 조회합니다.
   *
   * @param offset 조회 시작 위치
   * @param limit 조회할 데이터 개수
   * @param orderBy 정렬 방향
   * @returns [포트폴리오 목록, 전체 개수] 튜플
   *
   * @throws Error 데이터베이스 조회 중 오류가 발생할 경우
   */
  findAllWithPaging(offset: number, limit: number, orderBy: string): Promise<[Portfolio[], number]>;

  /**
   * 전체 포트폴리오 개수를 조회합니다.
   *
   * @returns 전체 포트폴리오 개수
   *
   * @throws Error 데이터베이스 조회 중 오류가 발생할 경우
   */
  count(): Promise<number>;

  /**
   * Portfolio 엔티티를 수정합니다.
   *
   * @param oldPortfolio 기존 Portfolio 인스턴스
   * @param newPortfolio 수정할 Portfolio 인스턴스
   * @returns 수정된 Portfolio 엔티티
   *
   * @throws Error 수정 과정에서 데이터베이스 오류가 발생할 경우
   */
  update(oldPortfolio: Portfolio, newPortfolio: Portfolio): Promise<Portfolio>;

  /**
   * Portfolio 엔티티를 삭제합니다.
   *
   * @param portfolioId 삭제할 Portfolio의 ID
   * @returns 삭제된 Portfolio의 ID
   *
   * @throws Error 삭제 과정에서 데이터베이스 오류가 발생할 경우
   */
  deleteById(id: number): Promise<number>;

  /**
   * 메인 상태에 따라 포트폴리오 목록을 조회합니다.
   *
   * @param mainState 메인 상태 (true/false)
   * @returns 해당 메인 상태의 포트폴리오 목록
   *
   * @throws Error 데이터베이스 조회 중 오류가 발생할 경우
   */
  findByMainState(mainState: boolean): Promise<Portfolio[]>;
}
