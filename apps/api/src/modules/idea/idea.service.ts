import { IdeaEntity } from '@app/db';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IdeaService {
  constructor() {}

  async getMany(userId: string) {
    return [];
  }

  async create(userId: string, dto: { name: string; angle?: string }) {
    return;
  }

  async updateOne(
    id: string,
    userId: string,
    dto: { name?: string; angle?: string },
  ) {
    return;
  }

  async deleteOne(id: string, userId: string) {
    return;
  }
}
