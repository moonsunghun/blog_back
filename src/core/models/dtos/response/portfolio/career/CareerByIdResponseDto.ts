import { Career } from '../../../../entities/portfolio/Career';

/**
 * @swagger
 * components:
 *   schemas:
 *     CareerByIdResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: "포트폴리오 경력 ID"
 *           example: 101
 *         companyName:
 *           type: string
 *           description: "회사명"
 *           example: "카카오"
 *         position:
 *           type: string
 *           description: "직무"
 *           example: "프론트엔드 개발자"
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
export class CareerByIdResponseDto {
  readonly id!: number;
  readonly companyName!: string;
  readonly position!: string;
  readonly startDate!: Date;
  readonly endDate?: Date;

  constructor(career: Career) {
    this.id = career.id;
    this.companyName = career.companyName;
    this.position = career.position;
    this.startDate = career.startDate;
    this.endDate = career.endDate ?? undefined;
  }
}
