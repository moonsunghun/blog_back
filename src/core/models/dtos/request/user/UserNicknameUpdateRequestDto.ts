/**
 * @swagger
 * components:
 *   schemas:
 *     UserNickNameUpdateRequestDto:
 *       type: object
 *       required:
 *         - nickName
 *       properties:
 *         nickName:
 *           type: string
 *           description: 새 별명 (2자 이상 10자 이하, 한글/영어/숫자)
 *           example: "새별명123"
 */
export class UserNickNameUpdateRequestDto {
  nickName!: string;

  constructor(data?: Partial<UserNickNameUpdateRequestDto>) {
    if (data) {
      if (data.nickName !== undefined) {
        this.nickName = data.nickName;
      }
    }
  }
}
