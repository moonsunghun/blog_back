import { Career } from '../../../../entities/portfolio/Career';

/**
 * @swagger
 * components:
 *   schemas:
 *     CareerUpdateRequestDto:
 *       type: object
 *       required:
 *         - careerId
 *         - companyName
 *         - position
 *         - startDate
 *         - endDate
 *       properties:
 *         careerId:
 *           type: integer
 *           description: "수정할 포트폴리오 경력 ID"
 *           example: 101
 *         companyName:
 *           type: string
 *           description: "회사명"
 *           example: "네이버"
 *         position:
 *           type: string
 *           description: "직급"
 *           example: "백엔드 개발자"
 *         startDate:
 *           type: string
 *           description: "입사일"
 *           example: "2023-01-01"
 *         endDate:
 *           type: string
 *           description: "퇴사일"
 *           example: "2025-03-12"
 */
export class CareerUpdateRequestDto {
  careerId!: number;

  companyName!: string;

  position!: string;

  startDate!: string;

  endDate?: string;

  constructor(data?: Partial<CareerUpdateRequestDto>) {
    if (data) {
      if (data.careerId !== undefined) {
        this.careerId = data.careerId;
      }

      if (data.companyName !== undefined) {
        this.companyName = data.companyName;
      }

      if (data.position !== undefined) {
        this.position = data.position;
      }

      if (data.startDate !== undefined) {
        this.startDate = data.startDate;
      }

      if (data.endDate !== undefined) {
        this.endDate = data.endDate;
      }
    }
  }

  toEntity(careerUpdateRequestDto: CareerUpdateRequestDto) {
    const career = new Career();

    career.companyName = careerUpdateRequestDto.companyName;
    career.position = careerUpdateRequestDto.position;
    career.startDate = new Date(careerUpdateRequestDto.startDate);
    if (careerUpdateRequestDto.endDate) {
      career.endDate = new Date(careerUpdateRequestDto.endDate);
    } else {
      career.endDate = null;
    }

    return career;
  }
}
