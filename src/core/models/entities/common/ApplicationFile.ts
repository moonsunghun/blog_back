/**
 * 업로드된 파일 정보를 저장하는 엔티티입니다.
 *
 * 이 클래스는 게시글(Inquiry 등)과 연관된 첨부 파일의 메타데이터를 저장하며,
 * 파일의 종류, MIME 타입, 경로, 크기 등의 정보를 포함합니다.
 *
 * 주요 필드:
 * - relatedId: 연관된 엔티티 ID (예: Inquiry ID)
 * - originalName: 업로드 당시 파일의 원래 이름
 * - path: 서버에 저장된 파일 경로
 * - fileType: 파일의 형식 (image, video, document 중 하나)
 * - mimeType: 파일의 MIME 타입 (예: image/png)
 * - size: 파일 크기 (바이트 단위)
 *
 * 주의사항:
 * - 이 엔티티는 다형성 관계에서 사용되며, 관계 매핑은 비공식(논리적 연결)입니다.
 * - 실제 외래 키 제약은 존재하지 않습니다.
 */

import { Column, Entity } from 'typeorm';
import { IdentityEntity } from './IdentityEntity';
import { FileType } from '../../../types/Type';

@Entity('file')
export class ApplicationFile extends IdentityEntity {
  @Column('bigint', { comment: '연결된 엔티티의 ID (예: Inquiry ID)' })
  relatedId!: number | undefined;

  @Column('varchar', {
    length: 255,
    comment: '파일 원본명',
  })
  originalName!: string;

  @Column('varchar', {
    length: 255,
    comment: '저장 파일 경로',
  })
  path!: string;

  @Column('varchar', {
    length: 50,
    comment: '파일 형식 (image | video | document',
  })
  fileType!: FileType;

  @Column('varchar', {
    length: 100,
    comment: 'MIME Type (예: image/png)',
  })
  mimeType!: string;

  @Column('bigint', {
    comment: '파일 크기 (Byte)',
  })
  size!: number;
}
