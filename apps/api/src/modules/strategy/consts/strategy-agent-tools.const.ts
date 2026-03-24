import { z } from 'zod';

export enum StrategyAgentTool {
  UpdateAudienceSummary = 'update_audience_summary',
  AddCoreProblem = 'add_core_problem',
  RemoveCoreProblem = 'remove_core_problem',
  AddContentGoal = 'add_content_goal',
  RemoveContentGoal = 'remove_content_goal',
}

export const StrategyAgentToolInfo: Record<
  StrategyAgentTool,
  {
    name: string;
    description: string;
    schema: z.ZodTypeAny;
  }
> = {
  [StrategyAgentTool.UpdateAudienceSummary]: {
    name: StrategyAgentTool.UpdateAudienceSummary,
    description: 'Update audience summary',
    schema: z.object({
      summary: z.string().describe('New audience summary'),
    }),
  },
  [StrategyAgentTool.AddCoreProblem]: {
    name: StrategyAgentTool.AddCoreProblem,
    description: 'Add core problem',
    schema: z.object({
      problem: z.string().describe('New core problem'),
      idx: z.number().describe('Index to insert at'),
    }),
  },
  [StrategyAgentTool.RemoveCoreProblem]: {
    name: StrategyAgentTool.RemoveCoreProblem,
    description: 'Remove core problem',
    schema: z.object({
      idx: z.number().describe('Index to remove'),
    }),
  },
  [StrategyAgentTool.AddContentGoal]: {
    name: StrategyAgentTool.AddContentGoal,
    description: 'Add content goal',
    schema: z.object({
      goal: z.string().describe('New content goal'),
      idx: z.number().describe('Index to insert at'),
    }),
  },
  [StrategyAgentTool.RemoveContentGoal]: {
    name: StrategyAgentTool.RemoveContentGoal,
    description: 'Remove content goal',
    schema: z.object({
      idx: z.number().describe('Index to remove'),
    }),
  },
};
