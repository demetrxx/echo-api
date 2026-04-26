import { NoteEntity } from '@app/db';

import { inTag } from '@/common/utils';

export function injectNotes(notes?: NoteEntity[]) {
  if (!notes?.length) return ``;
  const notesString = notes.map((n) => inTag('note', n.text)).join('\n');
  return inTag('notes', notesString);
}
