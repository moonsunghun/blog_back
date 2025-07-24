import { BlogRepository } from '../../blog/BlogRepository';
import { Blog } from '../../../../models/entities/Blog';
import { AppDataSource } from '../../../../config/DatabaseConfig';
import { BlogSearchRequestDto } from '../../../../models/dtos/request/blog/BlogSearchRequestDto';
import { Repository, Like, DeleteResult } from 'typeorm';

/**
 * BlogRepository의 TypeORM 기반 구현체입니다.
 *
 * 실제 데이터베이스 연동을 통해 Blog 엔티티의 CRUD 및 검색 기능을 제공합니다.
 *
 * 주요 기능:
 * - save: Blog 엔티티 저장
 * - findById: ID로 Blog 조회
 * - findAllWithSearch: 검색/페이징 조건에 맞는 Blog 목록 조회
 */
export class BlogRepositoryImpl implements BlogRepository {
  private readonly repository: Repository<Blog>;

  constructor() {
    this.repository = AppDataSource.getRepository(Blog);
  }

  /**
   * Blog 엔티티를 저장합니다.
   * @param blog 저장할 Blog 인스턴스
   * @returns 저장된 Blog 엔티티의 ID
   */
  async save(blog: Blog): Promise<number> {
    const saved = await this.repository.save(blog);
    return saved.id;
  }

  /**
   * 주어진 ID에 해당하는 Blog 엔티티를 조회합니다.
   * @param id 조회할 Blog의 고유 ID
   * @returns Blog 엔티티 또는 null
   */
  async findById(id: number): Promise<Blog | null> {
    return this.repository.findOneBy({ id });
  }

  /**
   * 검색 및 페이징 조건에 맞는 Blog 목록을 조회합니다.
   * @param dto 검색/페이징 DTO
   * @returns [Blog[], number] - Blog 배열과 전체 개수
   */
  async findAllWithSearch(dto: BlogSearchRequestDto): Promise<[Blog[], number]> {
    const { pageNumber, perPageSize, orderBy, title } = dto;
    return this.repository.findAndCount({
      where: title ? { title: Like(`%${title}%`) } : {},
      order: { id: orderBy },
      skip: (pageNumber - 1) * perPageSize,
      take: perPageSize,
    });
  }

  async update(oldBlog: Blog, newBlog: Blog): Promise<Blog> {
    return await this.repository.save(this.repository.merge(oldBlog, newBlog));
  }

  async deleteById(id: number): Promise<number> {
    const deleteResult: DeleteResult = await this.repository.delete({
      id: id,
    });

    if (deleteResult.affected && deleteResult.affected > 0) {
      return id;
    } else {
      throw new Error(`블로그 게시글 ID ${id} 삭제 실패`);
    }
  }
}
