interface StrategyNamePromptInput {
  audience: string;
  goals: string[];
  problems: string[];
  themes: string[];
}

export const STRATEGY_NAME_PROMPT = (i: StrategyNamePromptInput) => `
You are an AI strategy name generator.

Your job is to generate a short name (2-3 words) for the following strategy:

Audience: ${i.audience}
Goals: ${i.goals.join(', ')}
Problems: ${i.problems.join(', ')}
Themes: ${i.themes.join(', ')}

Generate a short name (2-3 words) for the following strategy:
**return only the name and nothing else**
`;
