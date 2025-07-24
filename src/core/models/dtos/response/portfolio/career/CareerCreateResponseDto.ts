/**
 * @swagger
 * components:
 *   schemas:
 *     CareerCreateResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 */
export class CareerCreateResponseDto {
  readonly careerId!: number;

  constructor(careerId: number) {
    this.careerId = careerId;
  }
}
