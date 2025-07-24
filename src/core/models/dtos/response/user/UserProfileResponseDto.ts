/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfileResponseDto:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: 사용자 이메일(아이디)
 *           example: "user@example.com"
 *         nickname:
 *           type: string
 *           description: 사용자 별명
 *           example: "사용자123"
 */
export class UserProfileResponseDto {
  readonly email!: string;
  readonly nickName!: string;

  constructor(email: string, nickName: string) {
    this.email = email;
    this.nickName = nickName;
  }
}
