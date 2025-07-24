import { Education } from '../../../../entities/portfolio/Education';

/**
 * @swagger
 * components:
 *   schemas:
 *     EducationCreateRequestDto:
 *       type: object
 *       required:
 *         - schoolName
 *         - major
 *         - degree
 *         - startDate
 *         - endDate
 *       properties:
 *         schoolName:
 *           type: string
 *           example: "서울대학교"
 *         major:
 *           type: string
 *           example: "컴퓨터공학과"
 *         degree:
 *           type: string
 *           example: "학사"
 *         startDate:
 *           type: string
 *           example: "2018-03-01"
 *         endDate:
 *           type: string
 *           example: "2022-03-01"
 */

export class EducationCreateRequestDto {
  schoolName!: string;

  major!: string;

  degree?: string;

  startDate!: string;

  endDate?: string;

  constructor(data?: Partial<EducationCreateRequestDto>) {
    if (data) {
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

  toEntity(educationCreatedRequestDto: EducationCreateRequestDto) {
    const education = new Education();
    education.schoolName = educationCreatedRequestDto.schoolName;
    education.major = educationCreatedRequestDto.major;
    education.degree = educationCreatedRequestDto.degree ?? '';
    education.startDate = new Date(educationCreatedRequestDto.startDate);
    if (educationCreatedRequestDto.endDate) {
      education.endDate = new Date(educationCreatedRequestDto.endDate);
    }

    return education;
  }
}
