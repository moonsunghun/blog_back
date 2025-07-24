/**
 * @swagger
 * components:
 *   schemas:
 *     EducationCreateResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 */
export class EducationCreateResponseDto {
  readonly educationId!: number;

  constructor(educationId: number) {
    this.educationId = educationId;
  }
}
