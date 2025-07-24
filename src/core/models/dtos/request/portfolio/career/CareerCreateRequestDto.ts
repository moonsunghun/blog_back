import { Career } from '../../../../entities/portfolio/Career';

/**
 * @swagger
 * components:
 *   schemas:
 *     CareerCreateRequestDto:
 *       type: object
 *       required:
 *         - companyName
 *         - position
 *         - startDate
 *         - endDate
 *       properties:
 *         companyName:
 *           type: string
 *           example: "카카오"
 *         position:
 *           type: string
 *           example: "프론트엔드 개발자"
 *         startDate:
 *           type: string
 *           example: "2020-10-01"
 *         endDate:
 *           type: string
 *           example: "2022-12-25"
 */

export class CareerCreateRequestDto {
  companyName!: string;

  position!: string;

  startDate!: string;

  endDate?: string;

  constructor(data?: Partial<CareerCreateRequestDto>) {
    if (data) {
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

  toEntity(careerCreatedRequestDto: CareerCreateRequestDto) {
    const career = new Career();
    career.companyName = careerCreatedRequestDto.companyName;
    career.position = careerCreatedRequestDto.position;
    career.startDate = new Date(careerCreatedRequestDto.startDate);
    if (careerCreatedRequestDto.endDate) {
      career.endDate = new Date(careerCreatedRequestDto.endDate);
    }

    return career;
  }
}
