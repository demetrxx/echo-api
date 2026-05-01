import {
  NoteEntity,
  NoteItemEntity,
  NoteItemStatus,
  NoteItemType,
} from '@app/db';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { PaginationSortingQuery, trimNL } from '@/common/utils';
import { FileService } from '@/modules/file';
import { LlmService } from '@/modules/llm';

interface NoteItemDto {
  type: NoteItemType;
  value?: string;
  fileId?: string;
  meta?: {
    duration?: number;
  };
}

const MIN_TEXT_LENGTH_FOR_TITLE = 50;

@Injectable()
export class NoteService {
  private readonly logger = new Logger(NoteService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly llmService: LlmService,
    private readonly fileService: FileService,
  ) {}

  async getMany(
    userId: string,
    query: PaginationSortingQuery & { search?: string },
  ) {
    const { order, skip, take, search } = query;

    const qb = this.dataSource
      .getRepository(NoteEntity)
      .createQueryBuilder('note')
      .where('note.userId = :userId', { userId })
      .select([
        'note.id',
        'note.name',
        'note.text',
        'note.updatedAt',
        'note.createdAt',
      ])
      .leftJoin('note.items', 'note_item')
      .addSelect(['note_item.id', 'note_item.type'])
      .orderBy(`note.updatedAt`, order)
      .skip(skip)
      .take(take);

    if (search) {
      // name or text
      qb.andWhere('note.name ILIKE :search OR note.text ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [notes, total] = await qb.getManyAndCount();

    return {
      total,
      data: notes,
      skip,
      take,
    };
  }

  async create(
    userId: string,
    dto?: { name?: string; text?: string; items?: NoteItemDto[] },
  ) {
    const note = await this.dataSource.getRepository(NoteEntity).save({
      userId,
      name: dto?.name,
      text: dto?.text,
    });

    this.generateTitle(note.id, userId, note);

    if (dto?.items) {
      for (const item of dto.items) {
        await this.addNoteItem(note.id, userId, item);
      }
    }

    return this.getOne(note.id, userId);
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
    const note = await this.getOne(id, userId);

    await this.dataSource.getRepository(NoteEntity).update(id, {
      name: dto.name,
      text: dto.text,
    });

    if (dto.text) {
      note.text = dto.text;
    }

    if (dto.name) {
      note.name = dto.name;
    }

    this.generateTitle(note.id, userId, note);

    return note;
  }

  async deleteOne(id: string, userId: string) {
    await this.getOne(id, userId);

    await this.dataSource.getRepository(NoteEntity).softDelete(id);
  }

  async deleteMany(userId: string, ids: string[]) {
    const notes = await this.dataSource.getRepository(NoteEntity).find({
      where: { id: In(ids), userId },
    });

    if (notes.length !== ids.length) {
      throw Err.notFound('Notes not found');
    }

    await this.dataSource.getRepository(NoteEntity).softDelete(ids);
  }

  async generateTitle(id: string, userId: string, note: NoteEntity) {
    if (note.text?.length < MIN_TEXT_LENGTH_FOR_TITLE) {
      return;
    }

    if (note.generatingTitle) {
      return;
    }

    if (note.name) {
      return;
    }

    await this.dataSource.getRepository(NoteEntity).update(id, {
      generatingTitle: true,
    });

    const response = await this.llmService.fastClient.invoke(
      [
        {
          role: 'user',
          content: `Generate a short title (3-5 words) for the following text: """${text}""", \n **return only the title and nothing else**`,
        },
      ],
      {},
    );

    const title = (response.content as string).trim();

    this.updateOne(id, userId, { name: title });
  }

  async addNoteItem(id: string, userId: string, dto: NoteItemDto) {
    const note = await this.getOne(id, userId);

    if (dto.type === NoteItemType.Voice && dto.fileId) {
      const file = await this.fileService.getOne(dto.fileId);
      if (!file) {
        throw Err.notFound('File not found');
      }
      const buffer = await this.fileService.getBuffer(file.path);

      dto.value = await this.llmService.voiceToText({
        buffer,
        name: file.name,
        mime: file.mime,
      });

      await this.concatText(id, userId, dto.value);
    }

    return this.dataSource.getRepository(NoteItemEntity).save({
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
    const note = await this.dataSource.getRepository(NoteEntity).findOne({
      where: { id, userId },
    });

    if (!note.text) {
      this.generateTitle(id, userId, text);
    }

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
