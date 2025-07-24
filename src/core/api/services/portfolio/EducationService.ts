import { DefaultResponse } from '../../../constant/DefaultResponse';
import { HttpExceptionResponse } from '../../exception/HttpExceptionResponse';
import { EducationRepository } from '../../repositories/portfolio/EducationRepository';
import { EducationRepositoryImpl } from '../../repositories/implements/portfolio/EducationRepositoryImpl';
import { EducationCreateRequestDto } from '../../../models/dtos/request/portfolio/education/EducationCreateRequestDto';
import { EducationCreateResponseDto } from '../../../models/dtos/response/portfolio/education/EducationCreateResponseDto';
import { EducationUpdateRequestDto } from '../../../models/dtos/request/portfolio/education/EducationUpdateRequestDto';
import { EducationUpdateResponseDto } from '../../../models/dtos/response/portfolio/education/EducationUpdateResponseDto';
import { Education } from '../../../models/entities/portfolio/Education';
import { logger } from '../../../utilities/Logger';
import { EducationByIdResponseDto } from '../../../models/dtos/response/portfolio/education/EducationByIdResponseDto';

export class EducationService {
  private readonly educationRepository: EducationRepository = new EducationRepositoryImpl();

  async createEducation(
    educationCreatedRequestDto: EducationCreateRequestDto
  ): Promise<DefaultResponse<EducationCreateResponseDto>> {
    const educationId: number = await this.educationRepository.save(
      educationCreatedRequestDto.toEntity(educationCreatedRequestDto)
    );

    if (!educationId || educationId <= 0) {
      throw new HttpExceptionResponse(500, '포트폴리오 등록 실패 데이터 베이스 문제 발생');
    }

    return DefaultResponse.responseWithData(
      201,
      '학력 생성 성공',
      new EducationCreateResponseDto(educationId)
    );
  }

  async updateEducation(
    educationUpdateRequestDto: EducationUpdateRequestDto
  ): Promise<DefaultResponse<EducationUpdateResponseDto>> {
    const education: Education = await this.educationRepository.update(
      this.checkEducation(
        await this.educationRepository.findById(educationUpdateRequestDto.educationId)
      ),
      educationUpdateRequestDto.toEntity(educationUpdateRequestDto)
    );

    return DefaultResponse.responseWithData(
      200,
      '포트폴리오 학력 수정 성공',
      new EducationUpdateResponseDto(education.id)
    );
  }

  async deleteEducation(educationId: number): Promise<DefaultResponse<{ id: number }>> {
    try {
      const education: Education = this.checkEducation(
        await this.educationRepository.findById(educationId)
      );

      const deletedEducationId: number = await this.educationRepository.deleteById(education.id);

      return DefaultResponse.responseWithData(200, '포트폴리오 학력 삭제 성공', {
        id: deletedEducationId,
      });
    } catch (error: any) {
      if (error instanceof HttpExceptionResponse) {
        logger.error(`포트폴리오 학력 삭제 간 문제 발생 - 문제 내용: ${error.message}`);

        throw new HttpExceptionResponse(error.statusCode, error.message);
      } else {
        logger.error(`포트폴리오 학력 삭제 간 문제 발생 - 문제 내용: ${error.message}`);

        throw new HttpExceptionResponse(500, '내부 서버 문제 발생');
      }
    }
  }

  async getEducationList(): Promise<DefaultResponse<{ educations: EducationByIdResponseDto[] }>> {
    try {
      const educations: Education[] = await this.educationRepository.findAll();

      const educationByIdResponseDto = educations.map(
        (education: Education) => new EducationByIdResponseDto(education)
      );

      return DefaultResponse.responseWithData(200, '포트폴리오 학력 목록 조회 성공', {
        educations: educationByIdResponseDto,
      });
    } catch (error: any) {
      logger.error(`포트폴리오 학력 목록 조회 간 문제 발생 - 문제 내용: ${error.message}`);
      throw new HttpExceptionResponse(500, '포트폴리오 학력 목록 조회 실패');
    }
  }

  private checkEducation(education: Education | null): Education {
    if (!education) {
      throw new HttpExceptionResponse(404, '포트폴리오 학력 조회 실패');
    }

    return education;
  }
}
