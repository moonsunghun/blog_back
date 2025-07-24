import { Education } from '../../../../entities/portfolio/Education';

/**
 * @swagger
 * components:
 *   schemas:
 *     EducationByIdResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: "포트폴리오 학력 ID"
 *           example: 101
 *         schoolName:
 *           type: string
 *           description: "학교명"
 *           example: "서울대학교"
 *         major:
 *           type: string
 *           description: "전공"
 *           example: "컴퓨터공학과"
 *         degree:
 *           type: string
 *           description: "학위"
 *           example: "석사"
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: "2020-01-01"
 *           description: "시작일"
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01"
 *           description: "종료일"
 */
export class EducationByIdResponseDto {
  readonly id!: number;
  readonly schoolName!: string;
  readonly major?: string;
  readonly degree!: string;
  readonly startDate!: Date;
  readonly endDate?: Date;

  constructor(education: Education) {
    this.id = education.id;
    this.schoolName = education.schoolName;
    this.major = education.major;
    this.degree = education.degree ?? '';
    this.startDate = education.startDate;
    this.endDate = education.endDate ?? undefined;
  }
}
