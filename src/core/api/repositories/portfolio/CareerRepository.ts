import { Career } from '../../../models/entities/portfolio/Career';

export interface CareerRepository {
  save(career: Career): Promise<number>;

  findById(careerId: number): Promise<Career | null>;

  update(oldCareer: Career, newCareer: Career): Promise<Career>;

  deleteById(id: number): Promise<number>;

  findAll(): Promise<Career[]>;
}
