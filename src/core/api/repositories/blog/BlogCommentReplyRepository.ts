import { BlogCommentReply } from '../../../models/entities/BlogCommentReply';

/**
 * 문의 게시글 댓글의 답글 저장소 인터페이스입니다.
 *
 * 이 인터페이스는 BlogCommentReply 관련 데이터베이스 연산을 정의합니다.
 * 구현체에서는 실제 저장소 로직을 정의하게 됩니다.
 *
 * 주요 기능:
 * - 댓글 저장 (save)
 * - 고유 번호를 이용한 조회 (findById)
 * - 블로그 게시글의 댓글 Entity와 댓글의 답글 고유 번호를 이용한 조회 (findByBlogCommentAndBlogCommentReplyId)
 * - 답글 고유번호를 이용한 답글 삭제 (delectByBlogCommentReplyId)
 */
export interface BlogCommentReplyRepository {
  /**
   * 답글 엔티티를 저장하는 메서드입니다.
   *
   * @param blogCommentReply 저장할 BlogCommentReply 엔티티
   * @returns 저장된 답글의 고유 ID
   */
  save(blogCommentReply: BlogCommentReply): Promise<number>;

  /**
   * 문의 게시글 댓글과 답글 ID를 기반으로 답글을 찾습니다.
   *
   * @param blogCommentId 블로그 게시글 댓글 ID
   * @param blogCommentReplyId 찾고자 하는 댓글의 답글 ID
   * @returns 일치하는 댓글 객체 또는 null (답글을 찾을 수 없는 경우).
   * @throws Error 데이터베이스 쿼리 실패 시.
   */
  findByBlogCommentAndBlogCommentReplyId(
    blogCommentId: number,
    blogCommentReplyId: number
  ): Promise<BlogCommentReply | null>;

  deleteByBlogCommentReplyId(blogCommentReplyId: number): Promise<number>;
}
