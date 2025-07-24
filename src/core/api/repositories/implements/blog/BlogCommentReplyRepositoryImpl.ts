import { Repository, DeleteResult } from 'typeorm';
import { BlogCommentReply } from '../../../../models/entities/BlogCommentReply';
import { BlogCommentReplyRepository } from '../../blog/BlogCommentReplyRepository';
import { AppDataSource } from '../../../../config/DatabaseConfig';

/**
 * 블로그 게시글 댓글의 답글 저장소 구현 클래스입니다.
 *
 * 이 클래스는 BlogCommentReplyRepository 인터페이스를 구현하며,
 * TypeORM의 Repository를 활용하여 BlogCommentReply 엔티티를 데이터베이스에 저장합니다.
 *
 * 주요 기능:
 * - 댓글 저장 (save)
 * - 고유 번호를 이용한 조회 (findById)
 * - 블로그 게시글의 댓글 Entity와 답글 고유 번호를 이용한 조회 (findByBlogCommentAndBlogCommentReplyId)
 *
 * 주의사항:
 * - AppDataSource 초기화가 선행되어야 합니다.
 */
export class BlogCommentReplyRepositoryImpl implements BlogCommentReplyRepository {
  private readonly blogCommentReplyRepository: Repository<BlogCommentReply>;

  /**
   * BlogCommentReplyRepositoryImpl 클래스의 생성자입니다.
   *
   * TypeORM DataSource(AppDataSource)로부터 BlogCommentReply에 대한 Repository를 주입받습니다.
   */
  constructor() {
    this.blogCommentReplyRepository = AppDataSource.getRepository(BlogCommentReply);
  }

  /**
   * 답글 엔티티를 저장하는 메서드입니다.
   *
   * @param blogCommentReply 저장할 BlogCommentReply 엔티티
   * @returns 저장된 답글의 고유 ID
   *
   * @throws 저장 실패 시 예외 발생
   */
  async save(blogCommentReply: BlogCommentReply): Promise<number> {
    return (await this.blogCommentReplyRepository.save(blogCommentReply)).id;
  }

  /**
   * 문의 게시글 댓글과 답글 ID를 기반으로 댓글을 찾습니다.
   *
   * @param blogCommentId 블로그 게시글 댓글 ID
   * @param blogCommentReplyId 찾고자 하는 답글 ID
   * @returns 일치하는 댓글 객체 또는 null (답글을 찾을 수 없는 경우).
   * @throws Error 데이터베이스 쿼리 실패 시.
   */
  async findByBlogCommentAndBlogCommentReplyId(
    blogCommentId: number,
    blogCommentReplyId: number
  ): Promise<BlogCommentReply | null> {
    return await this.blogCommentReplyRepository.findOne({
      where: {
        id: blogCommentReplyId,
        blogComment: {
          id: blogCommentId,
        },
      },
    });
  }

  async deleteByBlogCommentReplyId(blogCommentReplyId: number): Promise<number> {
    const deleteResult: DeleteResult = await this.blogCommentReplyRepository.delete({
      id: blogCommentReplyId,
    });

    if (deleteResult.affected && deleteResult.affected > 0) {
      return blogCommentReplyId;
    } else {
      throw new Error(`블로그 게시글 댓글 답글 ID ${blogCommentReplyId} 삭제 실패`);
    }
  }
}
