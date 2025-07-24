import { DeleteResult, Repository } from 'typeorm';
import { BlogCommentRepository } from '../../blog/BlogCommentRepository';
import { BlogComment } from '../../../../models/entities/BlogComment';
import { AppDataSource } from '../../../../config/DatabaseConfig';

/**
 * 문의 게시글 댓글 저장소 구현 클래스입니다.
 *
 * 이 클래스는 BlogCommentRepository 인터페이스를 구현하며,
 * TypeORM의 Repository를 활용하여 BlogComment 엔티티를 데이터베이스에 저장합니다.
 *
 * 주요 기능:
 * - 댓글 저장 (save)
 * - 고유 번호를 이용한 조회 (findById)
 * - 블로그 게시글 Entity와 댓글 고유 번호를 이용한 조회 (findByBlogAndBlogCommentId)
 * - 댓글 고유번호를 이용한 댓글 삭제 (delectByBlogCommentId)
 *
 * 주의사항:
 * - AppDataSource 초기화가 선행되어야 합니다.
 */
export class BlogCommentRepositoryImpl implements BlogCommentRepository {
  private readonly blogCommentRepository: Repository<BlogComment>;

  /**
   * BlogCommentRepositoryImpl 클래스의 생성자입니다.
   *
   * TypeORM DataSource(AppDataSource)로부터 BlogComment에 대한 Repository를 주입받습니다.
   */
  constructor() {
    this.blogCommentRepository = AppDataSource.getRepository(BlogComment);
  }

  async save(blogComment: BlogComment): Promise<number> {
    return (await this.blogCommentRepository.save(blogComment)).id;
  }

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
  async findById(blogCommentId: number): Promise<BlogComment | null> {
    return await this.blogCommentRepository.findOne({
      where: { id: blogCommentId },
      relations: ['blog'],
    });
  }

  /**
   * 문의 게시글과 댓글 ID를 기반으로 댓글을 찾습니다.
   *
   * @param blogId 블로그 게시글 ID
   * @param blogCommentId 찾고자 하는 댓글 ID
   * @returns 일치하는 댓글 객체 또는 null (댓글을 찾을 수 없는 경우).
   * @throws Error 데이터베이스 쿼리 실패 시.
   */
  async findByBlogAndBlogCommentId(
    blogId: number,
    blogCommentId: number
  ): Promise<BlogComment | null> {
    return await this.blogCommentRepository.findOne({
      where: {
        id: blogCommentId,
        blog: {
          id: blogId,
        },
      },
    });
  }

  async delectByBlogCommentId(blogCommentId: number): Promise<number> {
    const deleteResult: DeleteResult = await this.blogCommentRepository.delete({
      id: blogCommentId,
    });

    if (deleteResult.affected && deleteResult.affected > 0) {
      return blogCommentId;
    } else {
      throw new Error(`블로그 게시글 댓글 ID ${blogCommentId} 삭제 실패`);
    }
  }
}
