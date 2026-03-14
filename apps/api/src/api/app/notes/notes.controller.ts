import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';

import { PaginatedResponse } from '@/common/utils';
import { Protected, User } from '@/modules/auth';
import { NoteService } from '@/modules/note';

import {
  CreateNoteItemRequestDto,
  CreateNoteRequestDto,
  GetNotesQueryParams,
  NoteDetailsDto,
  NoteDto,
  UpdateNoteItemRequestDto,
  UpdateNoteRequestDto,
} from './dtos';
import {
  AddNoteItemOpenApi,
  CreateNoteOpenApi,
  DeleteNoteItemOpenApi,
  DeleteNoteOpenApi,
  GetNoteOpenApi,
  GetNotesOpenApi,
  UpdateNoteItemOpenApi,
  UpdateNoteOpenApi,
} from './notes.openapi';

@ApiTags('App / Notes')
@ApiExtraModels(PaginatedResponse)
@Controller()
@Protected()
export class NotesAppController {
  constructor(private readonly noteService: NoteService) {}

  @GetNotesOpenApi()
  @Get()
  async getMany(
    @User() user: User,
    @Query() query: GetNotesQueryParams,
  ): Promise<PaginatedResponse<NoteDto>> {
    const { data, total, skip, take } = await this.noteService.getMany(
      user.id,
      query,
    );

    return {
      total,
      data: data.map((note) => NoteDto.mapFromEntity(note)),
      skip,
      take,
    };
  }

  @GetNoteOpenApi()
  @Get(':id')
  async getOne(@Param('id') id: string, @User() user: User) {
    const note = await this.noteService.getOne(id, user.id);
    return NoteDetailsDto.mapFromEntity(note);
  }

  @CreateNoteOpenApi()
  @Post()
  async create(@Body() body: CreateNoteRequestDto, @User() user: User) {
    const note = await this.noteService.create(user.id, body);
    const createdNote = await this.noteService.getOne(note.id, user.id);

    return NoteDetailsDto.mapFromEntity(createdNote);
  }

  @UpdateNoteOpenApi()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateNoteRequestDto,
    @User() user: User,
  ) {
    await this.noteService.updateOne(id, user.id, body);
    const note = await this.noteService.getOne(id, user.id);

    return NoteDetailsDto.mapFromEntity(note);
  }

  @DeleteNoteOpenApi()
  @Delete(':id')
  async delete(@Param('id') id: string, @User() user: User) {
    await this.noteService.deleteOne(id, user.id);
    return { success: true };
  }

  @AddNoteItemOpenApi()
  @Post(':id/items')
  async addItem(
    @Param('id') id: string,
    @Body() body: CreateNoteItemRequestDto,
    @User() user: User,
  ) {
    await this.noteService.addNoteItem(id, user.id, body);
    const note = await this.noteService.getOne(id, user.id);

    return NoteDetailsDto.mapFromEntity(note);
  }

  @UpdateNoteItemOpenApi()
  @Patch(':id/items/:itemId')
  async updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() body: UpdateNoteItemRequestDto,
    @User() user: User,
  ) {
    await this.noteService.updateNoteItem(id, user.id, itemId, body);
    const note = await this.noteService.getOne(id, user.id);

    return NoteDetailsDto.mapFromEntity(note);
  }

  @DeleteNoteItemOpenApi()
  @Delete(':id/items/:itemId')
  async deleteItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @User() user: User,
  ) {
    await this.noteService.deleteNoteItem(id, user.id, itemId);
    return { success: true };
  }
}
