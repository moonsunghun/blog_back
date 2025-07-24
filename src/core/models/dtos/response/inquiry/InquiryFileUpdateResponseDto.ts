/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryFileUpdateResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: "파일 고유 ID"
 *           example: 42
 *         path:
 *           type: string
 *           description: "저장된 파일 경로"
 *           example: "/storage/images/12345.png"
 *         originalName:
 *           type: string
 *           description: "업로드 당시 파일명"
 *           example: "profile.png"
 *         deleteFileId:
 *           type: array
 *           description: "삭제된 파일 ID 목록 (선택)"
 *           items:
 *             type: number
 *           example: [3, 6]
 */
export class InquiryFileUpdateResponseDto {
  readonly id?: number;
  readonly path?: string;
  readonly originalName?: string;
  readonly deleteFileIds?: number[];

  constructor(partial: {
    id: number;
    path: string;
    originalName: string;
    deleteFileIds: Promise<number[] | undefined>;
  }) {
    Object.assign(this, partial);
  }
}
