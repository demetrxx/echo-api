import {
  NoteEntity,
  NoteItemEntity,
  NoteItemStatus,
  NoteItemType,
} from '@app/db';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { PaginationSortingQuery, trimNL } from '@/common/utils';
import { FileService } from '@/modules/file';
import { LlmService } from '@/modules/llm';

@Injectable()
export class NoteService {
  private readonly logger = new Logger(NoteService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly llmService: LlmService,
    private readonly fileService: FileService,
  ) {}

  async getMany(userId: string, query: PaginationSortingQuery) {
    const { orderBy, order, skip, take } = query;

    const [notes, total] = await this.dataSource
      .getRepository(NoteEntity)
      .createQueryBuilder('note')
      .where('note.userId = :userId', { userId })
      .select(['note.id', 'note.name', 'note.updatedAt', 'note.createdAt'])
      .orderBy(`note.${orderBy}`, order)
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return {
      total,
      data: notes,
      skip,
      take,
    };
  }

  async create(userId: string, dto?: { name?: string }) {
    return await this.dataSource.getRepository(NoteEntity).save({
      userId,
      name: dto?.name,
    });
  }

  async getOne(id: string, userId: string) {
    const note = await this.dataSource.getRepository(NoteEntity).findOne({
      where: { id, userId },
      relations: ['items', 'items.file'],
    });

    if (!note) {
      throw Err.notFound('Note not found');
    }

    return note;
  }

  async updateOne(
    id: string,
    userId: string,
    dto: { name?: string; text?: string },
  ) {
    await this.getOne(id, userId);

    await this.dataSource.getRepository(NoteEntity).update(id, {
      name: dto.name,
      text: dto.text,
    });
  }

  async deleteOne(id: string, userId: string) {
    await this.getOne(id, userId);

    await this.dataSource.getRepository(NoteEntity).softDelete(id);
  }

  async addNoteItem(
    id: string,
    userId: string,
    dto: {
      type: NoteItemType;
      value?: string;
      fileId?: string;
      meta?: {
        duration?: number;
      };
    },
  ) {
    const note = await this.getOne(id, userId);

    const noteItem = await this.dataSource.getRepository(NoteItemEntity).save({
      noteId: note.id,
      type: dto.type,
      status: [
        NoteItemType.Text,
        NoteItemType.Link,
        NoteItemType.Image,
        NoteItemType.File,
      ].includes(dto.type)
        ? NoteItemStatus.Processed
        : NoteItemStatus.Pending,
      value: dto.value,
      fileId: dto.fileId,
      meta: dto.meta,
    });

    if (dto.type === NoteItemType.Voice && dto.fileId) {
      const file = await this.fileService.getOne(dto.fileId);
      if (!file) {
        throw Err.notFound('File not found');
      }
      const buffer = await this.fileService.getBuffer(file.path);

      this.transcribeVoiceNote({
        userId,
        noteId: note.id,
        noteItemId: noteItem.id,
        buffer,
        name: file.name,
        mime: file.mime,
      });
    }

    return noteItem;
  }

  async updateNoteItem(
    id: string,
    userId: string,
    itemId: string,
    dto: { value?: string; status?: NoteItemStatus },
  ) {
    const noteItem = await this.dataSource
      .getRepository(NoteItemEntity)
      .findOne({
        where: { id: itemId, noteId: id, note: { userId } },
      });

    if (!noteItem) {
      throw Err.notFound('Note item not found');
    }

    await this.dataSource.getRepository(NoteItemEntity).update(itemId, dto);

    if (
      noteItem.type === NoteItemType.Voice &&
      dto.value &&
      dto.status === NoteItemStatus.Processed
    ) {
      await this.concatText(id, userId, dto.value);
    }
  }

  async concatText(id: string, userId: string, text: string) {
    const note = await this.getOne(id, userId);

    await this.updateOne(id, userId, {
      text: trimNL(note.text + '\n\n' + text),
    });
  }

  async transcribeVoiceNote(i: {
    userId: string;
    noteId: string;
    noteItemId: string;
    buffer: Buffer;
    name: string;
    mime: string;
  }) {
    const { userId, noteId, noteItemId, buffer, name, mime } = i;
    try {
      const text = await this.llmService.voiceToText({
        buffer,
        name,
        mime,
      });

      await this.updateNoteItem(noteId, userId, noteItemId, {
        value: text,
        status: NoteItemStatus.Processed,
      });
    } catch (error) {
      this.logger.error('Transcription error:', error);
      await this.updateNoteItem(noteId, userId, noteItemId, {
        status: NoteItemStatus.Failed,
      });
    }
  }

  async deleteNoteItem(id: string, userId: string, itemId: string) {
    const noteItem = await this.dataSource
      .getRepository(NoteItemEntity)
      .findOne({
        where: { id: itemId, noteId: id, note: { userId } },
      });

    if (!noteItem) {
      throw Err.notFound('Note item not found');
    }

    if (noteItem.type === NoteItemType.Text) {
      throw Err.badRequest('Cannot delete note text');
    }

    await this.dataSource.getRepository(NoteItemEntity).softDelete(itemId);
  }
}
