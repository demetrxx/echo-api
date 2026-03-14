import { TgUserEntity, UserEntity } from '@app/db';
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
      relations: ['tgUser'],
    });
  }

  async updateOne(id: string, dto: { firstName?: string; lastName?: string }) {
    const userRepository = this.dataSource.getRepository(UserEntity);
    await userRepository.update(id, dto);
  }

  async linkTelegram(
    id: string,
    dto: { username?: string; telegramId: string },
  ) {
    const tgUserRepository = this.dataSource.getRepository(TgUserEntity);

    const existing = await tgUserRepository.findOne({
      where: { userId: id },
    });

    if (existing) {
      await this.unlinkTelegram(id);
    }

    await tgUserRepository.save({
      userId: id,
      username: dto.username,
      telegramId: dto.telegramId,
    });
  }

  async unlinkTelegram(id: string) {
    const tgUserRepository = this.dataSource.getRepository(TgUserEntity);

    await tgUserRepository.delete({ userId: id });
  }
}
