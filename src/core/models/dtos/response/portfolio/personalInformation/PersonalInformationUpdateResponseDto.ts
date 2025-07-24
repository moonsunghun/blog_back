/**
 * @swagger
 * components:
 *   schemas:
 *     PersonalInformationUpdateResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: "수정된 포트폴리오 개인정보 고유 ID"
 *           example: 42
 */
export class PersonalInformationUpdateResponseDto {
  readonly personalInformationId: number;

  constructor(personalInformationId: number) {
    this.personalInformationId = personalInformationId;
  }
}
