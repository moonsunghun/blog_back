import { DefaultResponse } from '../../../constant/DefaultResponse';
import { HttpExceptionResponse } from '../../exception/HttpExceptionResponse';
import { CareerRepository } from '../../repositories/portfolio/CareerRepository';
import { CareerRepositoryImpl } from '../../repositories/implements/portfolio/CareerRepositoryImpl';
import { CareerCreateRequestDto } from '../../../models/dtos/request/portfolio/career/CareerCreateRequestDto';
import { CareerCreateResponseDto } from '../../../models/dtos/response/portfolio/career/CareerCreateResponseDto';
import { CareerUpdateRequestDto } from '../../../models/dtos/request/portfolio/career/CareerUpdateRequestDto';
import { CareerUpdateResponseDto } from '../../../models/dtos/response/portfolio/career/CareerUpdateResponseDto';
import { Career } from '../../../models/entities/portfolio/Career';
import { logger } from '../../../utilities/Logger';
import { CareerByIdResponseDto } from '../../../models/dtos/response/portfolio/career/CareerByIdResponseDto';

export class CareerService {
  private readonly careerRepository: CareerRepository = new CareerRepositoryImpl();

  async createCareer(
    careerCreatedRequestDto: CareerCreateRequestDto
  ): Promise<DefaultResponse<CareerCreateResponseDto>> {
    const careerId: number = await this.careerRepository.save(
      careerCreatedRequestDto.toEntity(careerCreatedRequestDto)
    );

    if (!careerId || careerId <= 0) {
      throw new HttpExceptionResponse(500, '포트폴리오 경력 등록 실패 데이터 베이스 문제 발생');
    }

    return DefaultResponse.responseWithData(
      201,
      '경력 생성 성공',
      new CareerCreateResponseDto(careerId)
    );
  }

  async updateCareer(
    careerUpdateRequestDto: CareerUpdateRequestDto
  ): Promise<DefaultResponse<CareerUpdateResponseDto>> {
    const career: Career = await this.careerRepository.update(
      this.checkCareer(await this.careerRepository.findById(careerUpdateRequestDto.careerId)),
      careerUpdateRequestDto.toEntity(careerUpdateRequestDto)
    );

    return DefaultResponse.responseWithData(
      200,
      '포트폴리오 경력 수정 성공',
      new CareerUpdateResponseDto(career.id)
    );
  }

  async deleteCareer(careerId: number): Promise<DefaultResponse<{ id: number }>> {
    try {
      const career: Career = this.checkCareer(await this.careerRepository.findById(careerId));

      const deletedCareerId: number = await this.careerRepository.deleteById(career.id);

      return DefaultResponse.responseWithData(200, '포트폴리오 경력 삭제 성공', {
        id: deletedCareerId,
      });
    } catch (error: any) {
      if (error instanceof HttpExceptionResponse) {
        logger.error(`포트폴리오 경력 삭제 간 문제 발생 - 문제 내용: ${error.message}`);

        throw new HttpExceptionResponse(error.statusCode, error.message);
      } else {
        logger.error(`포트폴리오 경력 삭제 간 문제 발생 - 문제 내용: ${error.message}`);

        throw new HttpExceptionResponse(500, '내부 서버 문제 발생');
      }
    }
  }

  async getCareerList(): Promise<DefaultResponse<{ careers: CareerByIdResponseDto[] }>> {
    try {
      const careers: Career[] = await this.careerRepository.findAll();

      const careerByIdResponseDto = careers.map(
        (career: Career) => new CareerByIdResponseDto(career)
      );

      return DefaultResponse.responseWithData(200, '포트폴리오 경력 목록 조회 성공', {
        careers: careerByIdResponseDto,
      });
    } catch (error: any) {
      logger.error(`포트폴리오 경력 목록 조회 간 문제 발생 - 문제 내용: ${error.message}`);
      throw new HttpExceptionResponse(500, '포트폴리오 경력 목록 조회 실패');
    }
  }

  private checkCareer(career: Career | null): Career {
    if (!career) {
      throw new HttpExceptionResponse(404, '포트폴리오 경력 조회 실패');
    }

    return career;
  }
}
