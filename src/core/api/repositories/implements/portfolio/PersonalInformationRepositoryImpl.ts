import { Repository } from 'typeorm';
import { PersonalInformationRepository } from '../../portfolio/PersonalInformationRepository';
import { PersonalInformation } from '../../../../models/entities/portfolio/PersonalInformation';
import { AppDataSource } from '../../../../config/DatabaseConfig';

export class PersonalInformationRepositoryImpl implements PersonalInformationRepository {
  private readonly personalInformationRepository: Repository<PersonalInformation>;

  constructor() {
    this.personalInformationRepository = AppDataSource.getRepository(PersonalInformation);
  }

  async save(personalInformation: PersonalInformation): Promise<number> {
    const result: PersonalInformation =
      await this.personalInformationRepository.save(personalInformation);
    return result.id;
  }

  async count(): Promise<number> {
    return await this.personalInformationRepository.count();
  }

  async getPersonalInformation(): Promise<PersonalInformation | null> {
    return await this.personalInformationRepository.findOne({
      where: {},
      order: { id: 'ASC' },
    });
  }

  async update(
    oldPersonalInformation: PersonalInformation,
    newPersonalInformation: PersonalInformation
  ): Promise<PersonalInformation> {
    return await this.personalInformationRepository.save(
      this.personalInformationRepository.merge(oldPersonalInformation, newPersonalInformation)
    );
  }
}
