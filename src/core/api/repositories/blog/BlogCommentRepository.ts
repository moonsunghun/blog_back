import { BlogComment } from '../../../models/entities/BlogComment';

export interface BlogCommentRepository {
  save(blogComment: BlogComment): Promise<number>;

  /**
   * 주어진 ID에 해당하는 문의 게시글의 댓글을 조회합니다.
   *
   * 이 메서드는 `blogCommentId`를 기반으로 데이터베이스에서 해당 블로그 게시글의 댓글을 검색합니다.
   *
   * @param blogCommentId - 조회할 블로그 게시글 댓글의 고유 ID
   * @returns 조회된 BlogComment 엔티티 또는 존재하지 않을 경우 null
   *
   * 주의사항:
   * - 삭제되었거나 존재하지 않는 ID의 경우 null이 반환됩니다.
   */
  findById(blogCommentId: number): Promise<BlogComment | null>;

  /**
   * 문의 게시글과 댓글 ID를 기반으로 댓글을 찾습니다.
   *
   * @param blogId 블로그 게시글 ID
   * @param blogCommentId 찾고자 하는 댓글 ID
   * @returns 일치하는 댓글 객체 또는 null (댓글을 찾을 수 없는 경우).
   * @throws Error 데이터베이스 쿼리 실패 시.
   */
  findByBlogAndBlogCommentId(blogId: number, blogCommentId: number): Promise<BlogComment | null>;

  delectByBlogCommentId(blogCommentId: number): Promise<number>;
}
