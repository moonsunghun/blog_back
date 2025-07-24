import { Blog } from '../../../models/entities/Blog';

/**
 * Blog 엔티티의 저장 기능을 정의하는 저장소 인터페이스입니다.
 *
 * 이 인터페이스는 커스텀 저장소 구현 시 필요한 메서드 시그니처를 정의하며,
 * 도메인 계층에서 의존성을 분리하기 위해 사용됩니다.
 *
 * 주요 기능:
 * - save: Blog 엔티티를 저장하고 해당 엔티티의 ID를 반환
 * - findById: Blog 고유번호 데이터베이스에서 조회
 * - findAllWithSearch: 검색 및 페이징 조건에 맞는 Blog 목록 조회
 *
 * 주의사항:
 * - 실제 저장소 구현체는 TypeORM 또는 In-Memory 방식일 수 있으며, 의존성 주입 등을 통해 구현됩니다.
 */
export interface BlogRepository {
  /**
   * Blog 엔티티를 저장합니다.
   *
   * @param blog 저장할 Blog 인스턴스
   * @returns 저장된 Blog 엔티티의 ID (Primary Key)
   *
   * @throws Error 저장 과정에서 데이터베이스 오류가 발생할 경우
   */
  save(blog: Blog): Promise<number>;

  /**
   * 주어진 ID에 해당하는 블로그 게시글을 조회합니다.
   *
   * 이 메서드는 `id`를 기반으로 데이터베이스에서 해당 블로그 게시글을 검색합니다.
   *
   * @param id - 조회할 블로그 게시글의 고유 ID
   * @returns 조회된 Blog 엔티티 또는 존재하지 않을 경우 null
   *
   * 주의사항:
   * - 삭제되었거나 존재하지 않는 ID의 경우 null이 반환됩니다.
   */
  findById(id: number): Promise<Blog | null>;

  /**
   * 검색 및 페이징 조건에 맞는 블로그 게시글 목록을 조회합니다.
   *
   * @param dto - 검색 및 페이징 조건이 담긴 DTO
   * @returns [Blog[], number] - 조회된 Blog 배열과 전체 개수
   */
  //findAllWithSearch(dto: BlogSearchRequestDto): Promise<[Blog[], number]>;
  // 필요에 따라 추가 메서드 정의 가능

  update(oldBlog: Blog, newBlog: Blog): Promise<Blog>;

  deleteById(id: number): Promise<number>;
}
