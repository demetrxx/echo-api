import { groupInRows } from '../lib';
import { BotContext } from '../types';

const text = `*Choose your dream partner and dive into a world of fantasy 💗*

*Unlock Unlimited Chats & Exclusive Content — /subscription 🔥*
`;

export const showStartScreen = async (
  ctx: BotContext,
  characters: { name: string; emoji: string }[],
) => {
  // Generate character buttons
  const girlButtons = characters.map((c) => ({
    text: `${c.name} ${c.emoji}`,
    callback_data: 'character_' + c.name,
  }));

  // Group buttons into rows of 2
  const girlButtonRows = groupInRows(girlButtons, 2);

  await ctx.replyWithPhoto(
    'https://d3t73m5p5h292a.cloudfront.net/87fe0fc6-0d2f-4473-9638-949f53d3914f-5426840351760126924.jpg',
    {
      caption: text,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          ...girlButtonRows,
          [
            {
              text: 'Join Community 🔥',
              url: 'https://t.me/aerasecrets18',
            },
          ],
          [
            {
              text: 'Lounge 🤍',
              url: 'https://t.me/aerachat',
            },
            {
              text: 'Play Now ⭐️',
              web_app: {
                url: `${process.env.TELEGRAM_MINI_APP_URL}`,
              },
            },
          ],
        ],
      },
    },
  );
};
