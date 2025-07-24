import { PersonalInformation } from '../../../../entities/portfolio/PersonalInformation';

/**
 * @swagger
 * components:
 *   schemas:
 *     PersonalInformationGetResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: "개인정보 ID"
 *           example: 42
 *         name:
 *           type: string
 *           description: "이름"
 *           example: "홍길동"
 *         birthDate:
 *           type: string
 *           description: "생년월일"
 *           example: "1990-01-01"
 *         gender:
 *           type: string
 *           description: "성별 [남성, 여성]"
 *           example: "남성"
 *         address:
 *           type: string
 *           description: "주소"
 *           example: "서울시 강남구 역삼동"
 *         email:
 *           type: string
 *           description: "이메일"
 *           example: "example@example.com"
 *         contact:
 *           type: string
 *           description: "전화번호"
 *           example: "010-1234-5678"
 */
export class PersonalInformationGetResponseDto {
  readonly id!: number;
  readonly name!: string;
  readonly birthDate!: Date;
  readonly gender!: string;
  readonly address!: string;
  readonly email!: string;
  readonly contact!: string;

  constructor(personalInformation: PersonalInformation) {
    this.id = personalInformation.id;
    this.name = personalInformation.name;
    this.birthDate = personalInformation.birthDate;
    this.gender = personalInformation.gender;
    this.address = personalInformation.address;
    this.email = personalInformation.email;
    this.contact = personalInformation.contact;
  }
}
