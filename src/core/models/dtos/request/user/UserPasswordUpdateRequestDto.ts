/**
 * @swagger
 * components:
 *   schemas:
 *     UserPasswordUpdateRequestDto:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *         - newPasswordConfirm
 *       properties:
 *         currentPassword:
 *           type: string
 *           description: 현재 비밀번호
 *         newPassword:
 *           type: string
 *           description: 새 비밀번호 (8자 이상 32자 이하, 영문+숫자+특수문자)
 *         newPasswordConfirm:
 *           type: string
 *           description: 새 비밀번호 확인
 */
export class UserPasswordUpdateRequestDto {
  currentPassword!: string;
  newPassword!: string;
  newPasswordConfirm!: string;

  constructor(data?: Partial<UserPasswordUpdateRequestDto>) {
    if (data) {
      if (data.currentPassword !== undefined) {
        this.currentPassword = data.currentPassword;
      }
      if (data.newPassword !== undefined) {
        this.newPassword = data.newPassword;
      }
      if (data.newPasswordConfirm !== undefined) {
        this.newPasswordConfirm = data.newPasswordConfirm;
      }
    }
  }
}
