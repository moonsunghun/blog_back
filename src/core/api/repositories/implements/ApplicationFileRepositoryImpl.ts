import { ApplicationFileRepository } from '../ApplicationFileRepository';
import { DeleteResult, In, Repository } from 'typeorm';
import { ApplicationFile } from '../../../models/entities/common/ApplicationFile';
import { AppDataSource } from '../../../config/DatabaseConfig';

/**
 * 파일 메타데이터를 저장하는 ApplicationFileRepository 인터페이스의 구현체입니다.
 *
 * TypeORM의 Repository를 활용하여 ApplicationFile 엔티티를 DB에 저장하며,
 * 단일 저장 및 다중 일괄 저장 메서드를 제공합니다.
 *
 * 주요 기능:
 * - 파일 단일 저장 (save)
 * - 파일 다중 저장 후 경로/원본명 반환 (saveAll)
 *
 * 주의사항:
 * - 실제 파일은 서버 디스크에 이미 저장되어 있어야 하며, 본 클래스는 메타데이터만 처리합니다.
 * - AppDataSource가 정상 초기화되지 않았을 경우 오류가 발생할 수 있습니다.
 */
export class ApplicationFileRepositoryImpl implements ApplicationFileRepository {
  /** TypeORM의 ApplicationFile 전용 Repository */
  private readonly fileRepository: Repository<ApplicationFile>;

  /**
   * 생성자에서 ApplicationFile에 대한 Repository를 초기화합니다.
   */
  constructor() {
    this.fileRepository = AppDataSource.getRepository(ApplicationFile);
  }

  /**
   * 단일 파일 메타데이터를 저장합니다.
   *
   * @param file 저장할 ApplicationFile 인스턴스
   * @returns 저장된 파일의 고유 ID
   */
  async save(file: ApplicationFile): Promise<number> {
    const result = await this.fileRepository.save(file);
    return result.id;
  }

  /**
   * 여러 개의 파일 메타데이터를 일괄 저장하고,
   * 각 파일의 ID, 저장 경로, 원본명을 반환합니다.
   *
   * @param files ApplicationFile 배열
   * @returns 저장 결과 배열 [{ id, path, originalName }]
   */
  async saveAll(files: ApplicationFile[]): Promise<
    {
      id: number;
      path: string;
      originalName: string;
    }[]
  > {
    const results: ApplicationFile[] = await this.fileRepository.save(files);

    return results.map((file) => ({
      id: file.id,
      path: file.path,
      originalName: file.originalName,
    }));
  }

  /**
   * 주어진 파일 ID 목록에 해당하는 문의 게시글 파일들을 조회합니다.
   *
   * - 전달된 ID 배열이 비어 있으면 빈 배열을 즉시 반환합니다.
   * - ID 배열이 존재할 경우 TypeORM의 `find` 메서드를 통해 해당 파일들을 조회합니다.
   *
   * @param inquiryFileIds - 조회할 파일 ID 배열
   * @returns ID에 해당하는 `ApplicationFile` 엔티티 목록
   */
  async findByIds(inquiryFileIds: number[]): Promise<ApplicationFile[]> {
    return await this.fileRepository.find({
      where: {
        id: In(this.checkFileIds(inquiryFileIds)),
      },
    });
  }

  /**
   * 주어진 관련 ID(relatedId)를 기반으로 연결된 모든 파일 정보를 조회합니다.
   *
   * 주요 기능:
   * - 특정 엔티티(예: Inquiry 등)와 연관된 모든 ApplicationFile 엔티티 목록을 반환합니다.
   *
   * @param relatedId 파일과 연동된 엔티티의 고유 ID
   * @returns 관련된 파일(ApplicationFile) 목록
   */
  async findByRelatedId(relatedId: number): Promise<ApplicationFile[]> {
    return await this.fileRepository.find({
      where: {
        relatedId: relatedId,
      },
    });
  }

  /**
   * 지정한 ID를 가진 첨부 파일 엔티티를 삭제합니다.
   *
   * 주요 기능:
   * - TypeORM의 `delete` 메서드를 사용하여 파일 엔티티를 삭제합니다.
   * - 삭제 성공 여부를 확인한 후 ID를 반환하거나, 실패 시 예외를 던집니다.
   *
   * 예외 처리:
   * - 삭제 결과의 `affected` 값이 없거나 0 이하인 경우 예외를 발생시킵니다.
   *
   * @param id 삭제 대상 파일의 고유 ID
   * @returns 삭제된 파일 ID
   * @throws Error 파일 삭제에 실패한 경우 (삭제 대상이 존재하지 않거나 DB 오류)
   */
  async deleteById(id: number): Promise<number | null> {
    const deleteResult: DeleteResult = await this.fileRepository.delete({
      id: id,
    });

    if (deleteResult.affected && deleteResult.affected > 0) {
      return id;
    } else {
      throw new Error(`문의 게시글의 첨부 파일 ID ${id} 삭제 실패`);
    }
  }

  /**
   * 주어진 파일 ID 목록에 해당하는 파일들을 삭제하고, 삭제된 ID 목록을 반환합니다.
   *
   * 주요 처리 과정:
   * - 전달된 파일 ID 배열을 유효성 검사 (`checkFileIds`) 합니다.
   * - 해당 ID에 대응하는 파일들을 데이터베이스에서 조회합니다.
   * - 조회된 파일이 없다면 빈 배열을 반환합니다.
   * - 존재하는 파일들을 삭제한 뒤, 삭제된 파일들의 ID 배열을 반환합니다.
   *
   * @param inquiryFileIds - 삭제할 파일 ID 배열
   * @returns 삭제된 파일들의 ID 배열
   */
  async deleteByIds(inquiryFileIds: number[]): Promise<number[]> {
    const files: ApplicationFile[] = await this.findByIds(this.checkFileIds(inquiryFileIds));

    if (!files.length) {
      return [];
    }

    const idsToDelete: number[] = files.map((file) => file.id);

    await this.fileRepository.delete(idsToDelete);

    return idsToDelete;
  }

  /**
   * 파일 ID 배열의 유효성을 확인하고 반환합니다.
   *
   * 주요 기능:
   * - 전달받은 파일 ID 배열이 비어있으면 빈 배열을 반환합니다.
   * - 그렇지 않으면 원본 배열을 그대로 반환합니다.
   *
   * 사용 목적:
   * - DB 쿼리 또는 삭제 로직에서 빈 배열을 안전하게 처리하기 위함입니다.
   *
   * @param inquiryFileIds 확인할 파일 ID 배열
   * @returns 원본 파일 ID 배열 또는 빈 배열
   */
  private checkFileIds(inquiryFileIds: number[]): number[] {
    if (!inquiryFileIds.length) {
      return [];
    }

    return inquiryFileIds;
  }
}
