import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { NoteDetailsDto, NoteDto } from '@/api/app/notes/dtos';
import { ApiPaginatedResponse } from '@/common/utils';

export const GetNotesOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get notes',
      description: 'Retrieve a paginated list of notes',
    }),
    ApiPaginatedResponse(NoteDto),
  );

export const GetNoteOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get note details',
      description: 'Retrieve a note with its items',
    }),
    ApiOkResponse({
      description: 'Note retrieved successfully',
      type: NoteDetailsDto,
    }),
  );

export const CreateNoteOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create note',
      description: 'Create a new note with an initial text item',
    }),
    ApiOkResponse({
      description: 'Note created successfully',
      type: NoteDetailsDto,
    }),
  );

export const UpdateNoteOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update note',
      description: 'Update note metadata',
    }),
    ApiOkResponse({
      description: 'Note updated successfully',
      type: NoteDetailsDto,
    }),
  );

export const DeleteNoteOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete note',
      description: 'Delete a note',
    }),
    ApiOkResponse({
      description: 'Note deleted successfully',
    }),
  );

export const AddNoteItemOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Add note item',
      description: 'Add an item to a note',
    }),
    ApiOkResponse({
      description: 'Note item added successfully',
      type: NoteDetailsDto,
    }),
  );

export const UpdateNoteItemOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update note item',
      description: 'Update a note item',
    }),
    ApiOkResponse({
      description: 'Note item updated successfully',
      type: NoteDetailsDto,
    }),
  );

export const DeleteNoteItemOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete note item',
      description: 'Delete a note item',
    }),
    ApiOkResponse({
      description: 'Note item deleted successfully',
    }),
  );
