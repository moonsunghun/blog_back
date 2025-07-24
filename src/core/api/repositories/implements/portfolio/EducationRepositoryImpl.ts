import { DeleteResult, Repository } from 'typeorm';
import { AppDataSource } from '../../../../config/DatabaseConfig';
import { Education } from '../../../../models/entities/portfolio/Education';
import { EducationRepository } from '../../portfolio/EducationRepository';

export class EducationRepositoryImpl implements EducationRepository {
  private readonly educationRepository: Repository<Education>;

  constructor() {
    this.educationRepository = AppDataSource.getRepository(Education);
  }

  async save(education: Education): Promise<number> {
    const result: Education = await this.educationRepository.save(education);
    return result.id;
  }

  async findById(educationId: number): Promise<Education | null> {
    return await this.educationRepository.findOne({
      where: { id: educationId },
    });
  }

  async update(oldEducation: Education, newEducation: Education): Promise<Education> {
    return await this.educationRepository.save(
      this.educationRepository.merge(oldEducation, newEducation)
    );
  }

  async deleteById(id: number): Promise<number> {
    const deleteResult: DeleteResult = await this.educationRepository.delete({ id: id });

    if (deleteResult.affected && deleteResult.affected > 0) {
      return id;
    } else {
      throw new Error(`포트폴리오 학력 ID ${id} 삭제 실패`);
    }
  }

  async findAll(): Promise<Education[]> {
    return await this.educationRepository.find({
      order: {
        startDate: 'ASC',
      },
    });
  }
}
