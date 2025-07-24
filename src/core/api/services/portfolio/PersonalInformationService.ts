import { DefaultResponse } from '../../../constant/DefaultResponse';
import { HttpExceptionResponse } from '../../exception/HttpExceptionResponse';
import { PersonalInformationRepository } from '../../repositories/portfolio/PersonalInformationRepository';
import { PersonalInformationRepositoryImpl } from '../../repositories/implements/portfolio/PersonalInformationRepositoryImpl';
import { PersonalInformationCreateRequestDto } from '../../../models/dtos/request/portfolio/personalInformation/PersonalInformationCreateRequestDto';
import { PersonalInformationCreateResponseDto } from '../../../models/dtos/response/portfolio/personalInformation/PersonalInformationCreateResponseDto';
import { PersonalInformationUpdateRequestDto } from '../../../models/dtos/request/portfolio/personalInformation/PersonalInformationUpdateRequestDto';
import { PersonalInformationUpdateResponseDto } from '../../../models/dtos/response/portfolio/personalInformation/PersonalInformationUpdateResponseDto';
import { PersonalInformation } from '../../../models/entities/portfolio/PersonalInformation';
import { PersonalInformationGetResponseDto } from '../../../models/dtos/response/portfolio/personalInformation/PersonalInformationGetResponseDto';

export class PersonalInformationService {
  private readonly personalInformationRepository: PersonalInformationRepository =
    new PersonalInformationRepositoryImpl();

  async createPersonalInformation(
    personalInformationCreatedRequestDto: PersonalInformationCreateRequestDto
  ): Promise<DefaultResponse<PersonalInformationCreateResponseDto>> {
    if ((await this.personalInformationRepository.count()) > 0) {
      throw new HttpExceptionResponse(400, '이미 개인정보가 존재합니다.');
    }

    const personalInformationId: number = await this.personalInformationRepository.save(
      personalInformationCreatedRequestDto.toEntity(personalInformationCreatedRequestDto)
    );

    if (!personalInformationId || personalInformationId <= 0) {
      throw new HttpExceptionResponse(500, '포트폴리오 등록 실패 데이터 베이스 문제 발생');
    }

    return DefaultResponse.responseWithData(
      201,
      '개인정보 생성 성공',
      new PersonalInformationCreateResponseDto(personalInformationId)
    );
  }

  async updatePersonalInformation(
    personalInformationUpdateRequestDto: PersonalInformationUpdateRequestDto
  ): Promise<DefaultResponse<PersonalInformationUpdateResponseDto>> {
    const oldPersonalInformation: PersonalInformation | null =
      await this.personalInformationRepository.getPersonalInformation();

    if (oldPersonalInformation === null) {
      throw new HttpExceptionResponse(404, '포트폴리오 개인정보를 찾을 수 없습니다.');
    }

    const newPersonalInformation: PersonalInformation =
      await this.personalInformationRepository.update(
        oldPersonalInformation,
        personalInformationUpdateRequestDto.toEntity(personalInformationUpdateRequestDto)
      );

    return DefaultResponse.responseWithData(
      200,
      '포트폴리오 개인정보 수정 성공',
      new PersonalInformationUpdateResponseDto(newPersonalInformation.id)
    );
  }

  async getPersonalInformation(): Promise<DefaultResponse<PersonalInformationGetResponseDto>> {
    const personalInformation: PersonalInformation | null =
      await this.personalInformationRepository.getPersonalInformation();

    if (personalInformation === null) {
      throw new HttpExceptionResponse(404, '포트폴리오 개인정보를 찾을 수 없습니다.');
    }

    return DefaultResponse.responseWithData(
      200,
      '포트폴리오 개인정보 조회 성공',
      new PersonalInformationGetResponseDto(personalInformation)
    );
  }
}
