import { ApplicationFile } from '../../models/entities/common/ApplicationFile';

/**
 * 파일 정보를 저장하기 위한 ApplicationFileRepository 인터페이스입니다.
 *
 * 이 인터페이스는 단일 파일 저장 및 다중 파일 일괄 저장 기능을 제공합니다.
 * 실제 구현체에서는 파일 메타데이터를 DB에 저장하며, 반환값으로 ID 및 파일 경로 등의 정보를 제공합니다.
 *
 * 주요 기능:
 * - save: 단일 파일 메타데이터 저장
 * - saveAll: 여러 파일을 일괄 저장하고 경로 및 이름 정보 반환
 *
 * 주의사항:
 * - 파일 자체는 이 로직에 포함되지 않으며, 파일 메타데이터(DB 저장용)만 처리됩니다.
 * - 파일 저장 결과는 DB 기준이며, 디스크 상의 실제 파일 저장과는 별도로 처리되어야 합니다.
 */
export interface ApplicationFileRepository {
  /**
   * 단일 파일 메타데이터를 저장합니다.
   *
   * @param file 저장할 ApplicationFile 객체
   * @returns 저장된 파일의 ID (Primary Key)
   * @throws Error DB 저장 실패 시 예외 발생
   */
  save(file: ApplicationFile): Promise<number>;

  /**
   * 여러 개의 파일 메타데이터를 일괄 저장합니다.
   *
   * @param files ApplicationFile 객체 배열
   * @returns 각 파일의 ID, 저장 경로, 원본 이름을 포함한 결과 배열
   *
   * @example
   * [
   *   { id: 1, path: 'storage/images/123-a.png', originalName: 'a.png' },
   *   { id: 2, path: 'storage/documents/124-b.pdf', originalName: 'b.pdf' },
   * ]
   *
   * @throws Error 저장 중 하나라도 실패할 경우 예외 발생 가능성 있음
   */
  saveAll(files: ApplicationFile[]): Promise<
    {
      id: number;
      path: string;
      originalName: string;
    }[]
  >;

  /**
   * 주어진 파일 ID 목록에 해당하는 문의 게시글 파일들을 조회합니다.
   *
   * - 전달된 ID 배열이 비어 있으면 빈 배열을 즉시 반환합니다.
   * - ID 배열이 존재할 경우 TypeORM의 `find` 메서드를 통해 해당 파일들을 조회합니다.
   *
   * @param inquiryFileIds - 조회할 파일 ID 배열
   * @returns ID에 해당하는 `ApplicationFile` 엔티티 목록
   */
  findByIds(inquiryFileIds: number[]): Promise<ApplicationFile[]>;

  /**
   * 주어진 관련 ID(relatedId)를 기반으로 연결된 모든 파일 정보를 조회합니다.
   *
   * 주요 기능:
   * - 특정 엔티티(예: Inquiry 등)와 연관된 모든 ApplicationFile 엔티티 목록을 반환합니다.
   *
   * @param relatedId 파일과 연동된 엔티티의 고유 ID
   * @returns 관련된 파일(ApplicationFile) 목록
   */
  findByRelatedId(relatedId: number): Promise<ApplicationFile[]>;

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
  deleteById(id: number): Promise<number | null>;

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
  deleteByIds(inquiryFileIds: number[]): Promise<number[]>;
}
