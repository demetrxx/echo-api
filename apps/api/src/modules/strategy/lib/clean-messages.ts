import { ChatMessage } from '@app/db';

export function cleanMessages(messages: any[]): ChatMessage[] {
  return messages.map((i) => {
    switch (i.type) {
      case 'tool':
        return {
          id: i.id,
          role: 'tool',
          content: i.content,
          name: i.name,
          tool_call_id: i.tool_call_id,
        };
      case 'ai':
        return {
          id: i.id,
          role: 'assistant',
          content: i.content,
          tool_calls: i.tool_calls,
        };
      case 'human':
        return {
          id: i.id,
          role: 'user',
          content: i.content,
        };
    }
  });
}
