/**
 * @swagger
 * components:
 *   schemas:
 *     CareerUpdateResponseDto:
 *       type: object
 *       properties:
 *         careerId:
 *           type: integer
 *           description: "수정된 포트폴리오 경력 ID"
 *           example: 1
 */
export class CareerUpdateResponseDto {
  readonly careerId!: number;

  constructor(careerId: number) {
    this.careerId = careerId;
  }
}
