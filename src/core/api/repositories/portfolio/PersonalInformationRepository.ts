import { PersonalInformation } from '../../../models/entities/portfolio/PersonalInformation';

export interface PersonalInformationRepository {
  save(personalInformation: PersonalInformation): Promise<number>;

  count(): Promise<number>;

  getPersonalInformation(): Promise<PersonalInformation | null>;

  update(
    oldPersonalInformation: PersonalInformation,
    newPersonalInformation: PersonalInformation
  ): Promise<PersonalInformation>;
}
