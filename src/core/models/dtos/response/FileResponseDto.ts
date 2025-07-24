/**
 * @swagger
 * components:
 *   schemas:
 *     FileResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: "파일 ID"
 *           example: 12
 *         path:
 *           type: string
 *           description: "파일 저장 경로 또는 접근 URL"
 *           example: "/storage/documents/2025/07/01/manual.pdf"
 */
export class FileResponseDto {
  readonly id!: number;
  readonly path!: string;

  constructor(id: number, path: string) {
    this.id = id;
    this.path = path;
  }
}
