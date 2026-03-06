import { UserEntity } from '@app/db';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getOne(id: string) {
    const userRepository = this.dataSource.getRepository(UserEntity);
    return userRepository.findOne({
      where: { id },
    });
  }

  async updateOne(id: string, dto: { firstName?: string; lastName?: string }) {
    const userRepository = this.dataSource.getRepository(UserEntity);
    await userRepository.update(id, dto);
  }
}
