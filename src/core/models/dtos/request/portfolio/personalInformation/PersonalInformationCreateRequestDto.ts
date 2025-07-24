import { PersonalInformationGender } from '../../../../../types/Enum';
import { PersonalInformation } from '../../../../entities/portfolio/PersonalInformation';

/**
 * @swagger
 * components:
 *   schemas:
 *     PersonalInformationCreateRequestDto:
 *       type: object
 *       required:
 *         - name
 *         - birthDate
 *         - gender
 *         - address
 *         - email
 *         - contact
 *       properties:
 *         name:
 *           type: string
 *           example: "홍길동"
 *         birthDate:
 *           type: string
 *           example: "1990-01-01"
 *         gender:
 *           type: string
 *           enum: [남성, 여성]
 *           example: "남성"
 *         address:
 *           type: string
 *           example: "서울시 강남구 역삼동"
 *         email:
 *           type: string
 *           example: "example@example.com"
 *         contact:
 *           type: string
 *           example: "010-1234-5678"
 */

export class PersonalInformationCreateRequestDto {
  name!: string;

  birthDate!: string;

  gender!: PersonalInformationGender;

  address!: string;

  email!: string;

  contact!: string;

  constructor(data?: Partial<PersonalInformationCreateRequestDto>) {
    if (data) {
      if (data.name !== undefined) {
        this.name = data.name;
      }

      if (data.birthDate !== undefined) {
        this.birthDate = data.birthDate;
      }

      if (data.gender !== undefined) {
        this.gender = data.gender;
      }

      if (data.address !== undefined) {
        this.address = data.address;
      }

      if (data.email !== undefined) {
        this.email = data.email;
      }

      if (data.contact !== undefined) {
        this.contact = data.contact;
      }
    }
  }

  toEntity(personalInformationCreatedRequestDto: PersonalInformationCreateRequestDto) {
    const personalInformation = new PersonalInformation();
    personalInformation.name = personalInformationCreatedRequestDto.name;
    personalInformation.birthDate = new Date(personalInformationCreatedRequestDto.birthDate);
    personalInformation.gender = personalInformationCreatedRequestDto.gender;
    personalInformation.address = personalInformationCreatedRequestDto.address;
    personalInformation.email = personalInformationCreatedRequestDto.email;
    personalInformation.contact = personalInformationCreatedRequestDto.contact;

    return personalInformation;
  }
}
