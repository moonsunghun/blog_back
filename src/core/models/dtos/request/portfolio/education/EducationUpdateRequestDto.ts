import { Education } from '../../../../entities/portfolio/Education';

/**
 * @swagger
 * components:
 *   schemas:
 *     EducationUpdateRequestDto:
 *       type: object
 *       required:
 *         - educationId
 *         - schoolName
 *         - major
 *         - degree
 *         - startDate
 *         - endDate
 *       properties:
 *         educationId:
 *           type: integer
 *           description: "수정할 포트폴리오 학력 ID"
 *           example: 101
 *         schoolName:
 *           type: string
 *           description: "학교명"
 *           example: "고려대학교"
 *         major:
 *           type: string
 *           description: "전공"
 *           example: "전기전자공학과"
 *         degree:
 *           type: string
 *           description: "학위"
 *           example: "석사"
 *         startDate:
 *           type: string
 *           description: "입학일"
 *           example: "2020-03-01"
 *         endDate:
 *           type: string
 *           description: "졸업일"
 *           example: "2024-03-01"
 */
export class EducationUpdateRequestDto {
  educationId!: number;

  schoolName!: string;

  major!: string;

  degree?: string;

  startDate!: string;

  endDate?: string;

  constructor(data?: Partial<EducationUpdateRequestDto>) {
    if (data) {
      if (data.educationId !== undefined) {
        this.educationId = data.educationId;
      }

      if (data.schoolName !== undefined) {
        this.schoolName = data.schoolName;
      }

      if (data.major !== undefined) {
        this.major = data.major;
      }

      if (data.degree !== undefined) {
        this.degree = data.degree;
      }

      if (data.startDate !== undefined) {
        this.startDate = data.startDate;
      }

      if (data.endDate !== undefined) {
        this.endDate = data.endDate;
      }
    }
  }

  toEntity(educationUpdateRequestDto: EducationUpdateRequestDto) {
    const education = new Education();

    education.schoolName = educationUpdateRequestDto.schoolName;
    education.major = educationUpdateRequestDto.major;
    education.degree = educationUpdateRequestDto.degree ?? null;
    education.startDate = new Date(educationUpdateRequestDto.startDate);
    if (educationUpdateRequestDto.endDate) {
      education.endDate = new Date(educationUpdateRequestDto.endDate);
    } else {
      education.endDate = null;
    }

    return education;
  }
}
