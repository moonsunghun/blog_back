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
 *         userType:
 *           type: string
 *           description: 사용자 역할 (user, administrator)
 *           example: "administrator"
 */
export class UserProfileResponseDto {
  readonly email!: string;
  readonly nickName!: string;
  readonly userType!: string;

  constructor(email: string, nickName: string, userType: string) {
    this.email = email;
    this.nickName = nickName;
    this.userType = userType;
  }
}
