import { NoteEntity, NoteThemeEntity, ThemeEntity } from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

const CREATED_NOTE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
const UPDATED_NOTE_THRESHOLD = 2 * 60 * 1000; // 2 minutes

@Injectable()
export class ThemeSuggestService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /*
   * Suggest themes for notes
   *
   * Candidates:
   *  1) Has text
   *  2) shouldSuggestThemes = true
   *  3) createdAt > 5 mins ago || updatedAt > 2 mins ago
   * */
  async suggestForNotes() {
    const now = new Date();
    const createdThreshold = new Date(now.getTime() - CREATED_NOTE_THRESHOLD);
    const updatedThreshold = new Date(now.getTime() - UPDATED_NOTE_THRESHOLD);

    const candidates = await this.dataSource
      .getRepository(NoteEntity)
      .createQueryBuilder('note')
      .where('note.suggestedThemes = :suggestedThemes', {
        shouldSuggestThemes: false,
      })
      .andWhere(
        'note.createdAt > :createdThreshold OR note.updatedAt > :updatedThreshold',
        {
          createdThreshold,
          updatedThreshold,
        },
      )
      .andWhere('note.text IS NOT NULL')
      .getMany();

    // todo: add to queue
    for (const note of candidates) {
      await this.suggestForNote(note);
    }
  }

  private async suggestForNote(note: NoteEntity) {
    const themes = await this.dataSource
      .getRepository(ThemeEntity)
      .createQueryBuilder('theme')
      .where('theme.userId = :userId', { userId: note.userId })
      .getMany();

    // todo: call llm
    const suggestedThemes: string[] = [];

    const themeIds = suggestedThemes.map(
      (theme) => themes.find((t) => t.cleanName === theme)?.id,
    );

    await this.dataSource.transaction(async (manager) => {
      const noteThemeRepository = manager.getRepository(NoteThemeEntity);
      await noteThemeRepository.delete({ noteId: note.id, isManual: false });

      await noteThemeRepository.save(
        themeIds.map((themeId) => ({
          noteId: note.id,
          themeId,
          isManual: false,
        })),
      );
      await manager.getRepository(NoteEntity).update(note.id, {
        shouldSuggestThemes: false,
      });
    });
  }
}
