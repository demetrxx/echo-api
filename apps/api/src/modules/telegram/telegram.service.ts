import { FileDir, NoteItemType, TgUserEntity } from '@app/db';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { FileService } from '@/modules/file';
import { NoteService } from '@/modules/note';

import { BotContext } from './types';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly noteService: NoteService,
    private readonly fileService: FileService,
  ) {}

  async createNote(ctx: BotContext) {
    const note = await this.noteService.create(ctx.user.id);
    await this.dataSource.getRepository(TgUserEntity).update(ctx.tgUser.id, {
      activeNoteId: note.id,
      lastActivityAt: new Date(),
    });
    ctx.tgUser.activeNoteId = note.id;
  }

  async addNoteItem(ctx: BotContext) {
    const shouldCreateNewNote = this.shouldCreateNewNote(ctx);

    if (shouldCreateNewNote) {
      const note = await this.noteService.create(ctx.user.id);
      await this.dataSource.getRepository(TgUserEntity).update(ctx.tgUser.id, {
        activeNoteId: note.id,
        lastActivityAt: new Date(),
      });
      ctx.tgUser.activeNoteId = note.id;
    }

    if (ctx.message.text) {
      await this.noteService.concatText(
        ctx.tgUser.activeNoteId,
        ctx.user.id,
        ctx.message.text,
      );
    }

    if (ctx.message.voice) {
      const file = await ctx.getFile();

      // @ts-expect-error is ok
      const arrayBuffer = await fetch(file.getUrl()).then((r) =>
        r.arrayBuffer(),
      );
      const buffer = Buffer.from(arrayBuffer);

      const fileEntity = await this.fileService.uploadOne({
        folder: FileDir.Private,
        buffer,
        mime: 'audio/ogg',
        fileName: `voice-${new Date().toISOString()}.ogg`,
      });

      const noteItem = await this.noteService.addNoteItem(
        ctx.tgUser.activeNoteId,
        ctx.user.id,
        {
          type: NoteItemType.Voice,
          fileId: fileEntity.id,
          meta: {
            duration: ctx.message.voice.duration,
          },
        },
      );

      // todo: add to queue
      this.noteService.transcribeVoiceNote({
        userId: ctx.user.id,
        noteId: ctx.tgUser.activeNoteId,
        noteItemId: noteItem.id,
        buffer,
        name: 'voice.ogg',
        mime: 'audio/ogg',
      });
    }

    return {
      isNew: shouldCreateNewNote,
    };
  }

  private shouldCreateNewNote(ctx: BotContext) {
    if (!ctx.tgUser.activeNoteId) {
      return true;
    }

    const newNoteThreshold = 10 * 60 * 1000; // 10 minutes

    if (
      new Date(ctx.tgUser.lastActivityAt).getTime() <
      Date.now() - newNoteThreshold
    ) {
      return true;
    }

    return false;
  }

  async updateLastActivityAt(id: string) {
    const userRepository = this.dataSource.getRepository(TgUserEntity);
    await userRepository.update(id, { lastActivityAt: new Date() });
  }

  async findUser(id: number) {
    const userRepository = this.dataSource.getRepository(TgUserEntity);

    return userRepository.findOne({
      where: { telegramId: String(id) },
      relations: ['user'],
    });
  }
}
