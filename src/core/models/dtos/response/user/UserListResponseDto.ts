/**
 * @swagger
 * components:
 *   schemas:
 *     UserListResponseDto:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: 회원 이메일
 *           example: "test@example.com"
 *         nickName:
 *           type: string
 *           description: 회원 별명
 *           example: "홍길동"
 *         blockState:
 *           type: boolean
 *           description: 차단 여부
 *           example: false
 */
import { User } from '../../../entities/User';
export class UserListResponseDto {
  email: string;
  nickName: string;
  blockState: boolean;

  constructor(user: User) {
    this.email = user.email;
    this.nickName = user.nickName;
    this.blockState = user.blockState;
  }
}
