/**
 * @swagger
 * components:
 *   schemas:
 *     EducationUpdateResponseDto:
 *       type: object
 *       properties:
 *         educationId:
 *           type: integer
 *           description: "수정된 포트폴리오 학력 ID"
 *           example: 1
 */
export class EducationUpdateResponseDto {
  readonly educationId!: number;

  constructor(educationId: number) {
    this.educationId = educationId;
  }
}
