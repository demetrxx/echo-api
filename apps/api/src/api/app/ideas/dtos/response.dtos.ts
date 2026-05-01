import { IdeaEntity, NoteIdeaEntity } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';

export class IdeaNoteDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  name: string | null;

  static mapFromEntity(entity: NoteIdeaEntity): IdeaNoteDto {
    return {
      id: entity.note?.id ?? entity.noteId ?? entity.id,
      name: entity.note?.name ?? null,
    };
  }
}

export class IdeaThemeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class IdeaVoiceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class IdeaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  isSaved: boolean | null;

  @ApiProperty({ required: false, nullable: true })
  angle: string | null;

  @ApiProperty({ required: false, nullable: true })
  strategyId: string | null;

  @ApiProperty({ required: false, nullable: true })
  themeId: string | null;

  @ApiProperty({ required: false, nullable: true })
  voiceId: string | null;

  @ApiProperty({ type: IdeaThemeDto, required: false, nullable: true })
  theme: IdeaThemeDto | null;

  @ApiProperty({ type: IdeaVoiceDto, required: false, nullable: true })
  voice: IdeaVoiceDto | null;

  @ApiProperty({ type: [IdeaNoteDto] })
  notes: IdeaNoteDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static mapFromEntity(entity: IdeaEntity): IdeaDto {
    return {
      id: entity.id,
      name: entity.name,
      angle: entity.angle ?? null,
      isSaved: entity.isSaved,
      strategyId: entity.strategyId ?? entity.strategy?.id ?? null,
      themeId: entity.themeId ?? entity.theme?.id ?? null,
      voiceId: entity.voiceId ?? entity.voice?.id ?? null,
      theme: entity.theme
        ? {
            id: entity.theme.id,
            name: entity.theme.name,
          }
        : null,
      voice: entity.voice
        ? {
            id: entity.voice.id,
            name: entity.voice.name,
          }
        : null,
      notes: (entity.notes ?? []).map((note) =>
        IdeaNoteDto.mapFromEntity(note),
      ),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
