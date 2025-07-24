/**
 * @swagger
 * components:
 *   schemas:
 *     UserWithdrawRequestDto:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         password:
 *           type: string
 *           description: 탈퇴 확인을 위한 현재 비밀번호
 *           example: "currentPassword123!"
 */
export class UserRequestDto {
  password!: string;

  constructor(data?: Partial<UserRequestDto>) {
    if (data) {
      if (data.password !== undefined) {
        this.password = data.password;
      }
    }
  }
}
