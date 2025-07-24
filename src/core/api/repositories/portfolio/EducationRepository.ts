import { Education } from '../../../models/entities/portfolio/Education';

export interface EducationRepository {
  save(education: Education): Promise<number>;

  findById(educationId: number): Promise<Education | null>;

  update(oldEducation: Education, newEducation: Education): Promise<Education>;

  deleteById(id: number): Promise<number>;

  findAll(): Promise<Education[]>;
}
