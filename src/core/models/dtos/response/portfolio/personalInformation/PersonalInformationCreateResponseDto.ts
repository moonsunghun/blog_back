/**
 * @swagger
 * components:
 *   schemas:
 *     PersonalInformationCreateResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 */
export class PersonalInformationCreateResponseDto {
  readonly personalInformationId!: number;

  constructor(personalInformationId: number) {
    this.personalInformationId = personalInformationId;
  }
}
