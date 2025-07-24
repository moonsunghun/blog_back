import { PersonalInformationGender } from '../../../../../types/Enum';
import { PersonalInformation } from '../../../../entities/portfolio/PersonalInformation';

/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryUpdateRequestDto:
 *       type: object
 *       required:
 *         - inquiryId
 *         - contentFormat
 *         - category
 *         - title
 *         - content
 *       properties:
 *         inquiryId:
 *           type: integer
 *           description: "수정할 문의 게시글 ID"
 *           example: 101
 *         contentFormat:
 *           type: string
 *           description: "본문 포맷"
 *           example: "HTML"
 *         category:
 *           type: string
 *           description: "문의 카테고리"
 *           enum: [기술, 신고, 기타]
 *           example: "기술"
 *         title:
 *           type: string
 *           description: "문의 제목"
 *           example: "에디터가 동작하지 않아요"
 *         content:
 *           type: string
 *           description: "문의 본문 내용"
 *           example: "<p>Toast UI Editor 사용 중 문제가 발생합니다.</p>"
 *         profilePictureUpdateStatus:
 *           type: boolean
 *           description: "프로필 사진 수정 상태"
 *           example: false
 */
export class PersonalInformationUpdateRequestDto {
  name!: string;

  birthDate!: string;

  gender!: PersonalInformationGender;

  address!: string;

  email!: string;

  contact!: string;

  constructor(data?: Partial<PersonalInformationUpdateRequestDto>) {
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

  toEntity(personalInformationUpdateRequestDto: PersonalInformationUpdateRequestDto) {
    const personalInformation = new PersonalInformation();

    personalInformation.name = personalInformationUpdateRequestDto.name;
    personalInformation.birthDate = new Date(personalInformationUpdateRequestDto.birthDate);
    personalInformation.gender = personalInformationUpdateRequestDto.gender;
    personalInformation.address = personalInformationUpdateRequestDto.address;
    personalInformation.email = personalInformationUpdateRequestDto.email;
    personalInformation.contact = personalInformationUpdateRequestDto.contact;

    return personalInformation;
  }
}
