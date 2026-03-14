import { BotContext } from '../types';

export async function showContinueChatScreen(
  ctx: BotContext,
  existingChatId: string,
  scenarioSlug: string,
) {
  await ctx.reply('💡Echo: You have an existing chat in this scenario', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Continue',
            callback_data: `continue_chat_${existingChatId}`,
          },
          {
            text: 'New Chat',
            callback_data: `new_chat_${scenarioSlug}`,
          },
        ],
      ],
    },
  });
}
