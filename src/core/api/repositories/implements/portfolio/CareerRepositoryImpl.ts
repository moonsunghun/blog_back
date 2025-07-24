import { DeleteResult, Repository } from 'typeorm';
import { AppDataSource } from '../../../../config/DatabaseConfig';
import { Career } from '../../../../models/entities/portfolio/Career';
import { CareerRepository } from '../../portfolio/CareerRepository';

export class CareerRepositoryImpl implements CareerRepository {
  private readonly careerRepository: Repository<Career>;

  constructor() {
    this.careerRepository = AppDataSource.getRepository(Career);
  }

  async save(career: Career): Promise<number> {
    const result: Career = await this.careerRepository.save(career);
    return result.id;
  }

  async findById(careerId: number): Promise<Career | null> {
    return await this.careerRepository.findOne({
      where: { id: careerId },
    });
  }

  async update(oldCareer: Career, newCareer: Career): Promise<Career> {
    return await this.careerRepository.save(this.careerRepository.merge(oldCareer, newCareer));
  }

  async deleteById(id: number): Promise<number> {
    const deleteResult: DeleteResult = await this.careerRepository.delete({ id: id });

    if (deleteResult.affected && deleteResult.affected > 0) {
      return id;
    } else {
      throw new Error(`포트폴리오 경력 ID ${id} 삭제 실패`);
    }
  }

  async findAll(): Promise<Career[]> {
    return await this.careerRepository.find({
      order: {
        startDate: 'ASC',
      },
    });
  }
}
