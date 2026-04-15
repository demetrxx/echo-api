import { PlatformType, StrategyContextBlockType, StrategyStage } from '@app/db';
import { z } from 'zod';

export enum StrategyAgentTool {
  UpdateAudience = 'update_audience',

  AddProblem = 'add_problem',
  RemoveProblem = 'remove_problem',

  AddGoal = 'add_goal',
  RemoveGoal = 'remove_goal',

  AddNote = 'add_note',
  RemoveNote = 'remove_note',

  AddPlatform = 'add_platform',
  RemovePlatform = 'remove_platform',

  UpdatePlatformNote = 'update_platform_note',

  AddUnresolvedQuestion = 'add_unresolved_question',
  RemoveUnresolvedQuestion = 'remove_unresolved_question',

  AddVoiceAdjustment = 'add_voice_adjustment',
  RemoveVoiceAdjustment = 'remove_voice_adjustment',

  // Custom
  AddContextBlock = 'add_context_block',
  RemoveContextBlock = 'remove_context_block',

  ChangeStage = 'change_stage',

  QueryThemes = 'query_themes',
  LinkTheme = 'link_theme',
  UnlinkTheme = 'unlink_theme',
  CreateTheme = 'create_theme',
  UpdateTheme = 'update_theme',

  QueryVoices = 'query_voices',
  CreateVoice = 'create_voice',
  UpdateVoice = 'update_voice',
  LinkVoice = 'link_voice',

  UpdateContext = 'update_context',
}

// todo: later: добавить voice creation based on posts.
// todo: later: добавить переход на ideation
export const STAGE_TOOLS: Record<StrategyStage, StrategyAgentTool[]> = {
  [StrategyStage.Diagnose]: [
    StrategyAgentTool.ChangeStage,
    StrategyAgentTool.AddContextBlock,
    StrategyAgentTool.RemoveContextBlock,

    StrategyAgentTool.UpdateAudience,

    StrategyAgentTool.AddGoal,
    StrategyAgentTool.RemoveGoal,

    StrategyAgentTool.AddPlatform,
    StrategyAgentTool.RemovePlatform,

    StrategyAgentTool.UpdatePlatformNote,

    StrategyAgentTool.AddUnresolvedQuestion,
    StrategyAgentTool.RemoveUnresolvedQuestion,
  ],
  [StrategyStage.Context]: [
    StrategyAgentTool.ChangeStage,

    StrategyAgentTool.UpdateContext,

    StrategyAgentTool.AddContextBlock,
    StrategyAgentTool.RemoveContextBlock,

    StrategyAgentTool.UpdateContext,

    StrategyAgentTool.AddNote,
    StrategyAgentTool.RemoveNote,

    StrategyAgentTool.AddUnresolvedQuestion,
    StrategyAgentTool.RemoveUnresolvedQuestion,
  ],
  [StrategyStage.Direction]: [
    StrategyAgentTool.ChangeStage,

    StrategyAgentTool.AddGoal,
    StrategyAgentTool.RemoveGoal,

    StrategyAgentTool.AddProblem,
    StrategyAgentTool.RemoveProblem,

    StrategyAgentTool.AddNote,
    StrategyAgentTool.RemoveNote,

    StrategyAgentTool.AddUnresolvedQuestion,
    StrategyAgentTool.RemoveUnresolvedQuestion,
  ],
  [StrategyStage.Themes]: [
    StrategyAgentTool.ChangeStage,

    StrategyAgentTool.QueryThemes,
    StrategyAgentTool.CreateTheme,
    StrategyAgentTool.UpdateTheme,
    StrategyAgentTool.LinkTheme,
    StrategyAgentTool.UnlinkTheme,

    StrategyAgentTool.AddNote,

    StrategyAgentTool.AddUnresolvedQuestion,

    StrategyAgentTool.AddUnresolvedQuestion,
    StrategyAgentTool.RemoveUnresolvedQuestion,
  ],
  [StrategyStage.Voice]: [
    StrategyAgentTool.ChangeStage,

    StrategyAgentTool.QueryVoices,
    StrategyAgentTool.CreateVoice,
    StrategyAgentTool.UpdateVoice,
    StrategyAgentTool.LinkVoice,

    StrategyAgentTool.AddVoiceAdjustment,
    StrategyAgentTool.RemoveVoiceAdjustment,

    StrategyAgentTool.AddNote,

    StrategyAgentTool.AddUnresolvedQuestion,
    StrategyAgentTool.RemoveUnresolvedQuestion,
  ],
  [StrategyStage.Sharpen]: [
    // all
    StrategyAgentTool.ChangeStage,
    StrategyAgentTool.AddContextBlock,
    StrategyAgentTool.UpdateAudience,
    StrategyAgentTool.AddProblem,
    StrategyAgentTool.RemoveProblem,
    StrategyAgentTool.AddGoal,
    StrategyAgentTool.RemoveGoal,
    StrategyAgentTool.AddNote,
    StrategyAgentTool.RemoveNote,
    StrategyAgentTool.AddPlatform,
    StrategyAgentTool.RemovePlatform,
    StrategyAgentTool.UpdatePlatformNote,
    StrategyAgentTool.AddUnresolvedQuestion,
    StrategyAgentTool.RemoveUnresolvedQuestion,
    StrategyAgentTool.AddVoiceAdjustment,
    StrategyAgentTool.RemoveVoiceAdjustment,
    // theme tools
    StrategyAgentTool.LinkTheme,
    StrategyAgentTool.UnlinkTheme,
    StrategyAgentTool.CreateTheme,
    StrategyAgentTool.UpdateTheme,
    // voice tools
    StrategyAgentTool.CreateVoice,
    StrategyAgentTool.UpdateVoice,
    StrategyAgentTool.LinkVoice,

    StrategyAgentTool.UpdateContext,
  ],
  [StrategyStage.FreeRefine]: [
    // all
    StrategyAgentTool.ChangeStage,
    StrategyAgentTool.AddContextBlock,
    StrategyAgentTool.UpdateAudience,
    StrategyAgentTool.AddProblem,
    StrategyAgentTool.RemoveProblem,
    StrategyAgentTool.AddGoal,
    StrategyAgentTool.RemoveGoal,
    StrategyAgentTool.AddNote,
    StrategyAgentTool.RemoveNote,
    StrategyAgentTool.AddPlatform,
    StrategyAgentTool.RemovePlatform,
    StrategyAgentTool.UpdatePlatformNote,
    StrategyAgentTool.AddUnresolvedQuestion,
    StrategyAgentTool.RemoveUnresolvedQuestion,
    StrategyAgentTool.AddVoiceAdjustment,
    StrategyAgentTool.RemoveVoiceAdjustment,
    // theme tools
    StrategyAgentTool.QueryThemes,
    StrategyAgentTool.LinkTheme,
    StrategyAgentTool.UnlinkTheme,
    StrategyAgentTool.CreateTheme,
    StrategyAgentTool.UpdateTheme,
    // voice tools
    StrategyAgentTool.QueryVoices,
    StrategyAgentTool.CreateVoice,
    StrategyAgentTool.UpdateVoice,
    StrategyAgentTool.LinkVoice,

    StrategyAgentTool.UpdateContext,
  ],
};

export const StrategyAgentToolInfo: Record<
  StrategyAgentTool,
  {
    name: string;
    description: string;
    schema: z.ZodTypeAny;
  }
> = {
  [StrategyAgentTool.ChangeStage]: {
    name: StrategyAgentTool.ChangeStage,
    description: 'Change strategy stage',
    schema: z.object({
      value: z.enum(StrategyStage).describe('Strategy stage to change to'),
    }),
  },
  [StrategyAgentTool.AddContextBlock]: {
    name: StrategyAgentTool.AddContextBlock,
    description: 'Add a context block',
    schema: z.object({
      value: z.enum(StrategyContextBlockType).describe('New context block'),
      idx: z.number().describe('Index to insert at'),
    }),
  },
  [StrategyAgentTool.RemoveContextBlock]: {
    name: StrategyAgentTool.RemoveContextBlock,
    description: 'Remove a context block',
    schema: z.object({
      idx: z.number().describe('Index to remove'),
    }),
  },
  [StrategyAgentTool.UpdateAudience]: {
    name: StrategyAgentTool.UpdateAudience,
    description: 'Update audience summary',
    schema: z.object({
      value: z.string().describe('New audience summary'),
    }),
  },
  [StrategyAgentTool.AddProblem]: {
    name: StrategyAgentTool.AddProblem,
    description: 'Add core problem',
    schema: z.object({
      value: z.string().describe('New core problem'),
      idx: z.number().describe('Index to insert at'),
    }),
  },
  [StrategyAgentTool.RemoveProblem]: {
    name: StrategyAgentTool.RemoveProblem,
    description: 'Remove core problem',
    schema: z.object({
      idx: z.number().describe('Index to remove'),
    }),
  },
  [StrategyAgentTool.AddGoal]: {
    name: StrategyAgentTool.AddGoal,
    description: 'Add content goal',
    schema: z.object({
      value: z.string().describe('New content goal'),
      idx: z.number().describe('Index to insert at'),
    }),
  },
  [StrategyAgentTool.RemoveGoal]: {
    name: StrategyAgentTool.RemoveGoal,
    description: 'Remove content goal',
    schema: z.object({
      idx: z.number().describe('Index to remove'),
    }),
  },
  [StrategyAgentTool.AddNote]: {
    name: StrategyAgentTool.AddNote,
    description: 'Add a note',
    schema: z.object({
      value: z.string().describe('New note'),
      idx: z.number().describe('Index to insert at'),
    }),
  },
  [StrategyAgentTool.RemoveNote]: {
    name: StrategyAgentTool.RemoveNote,
    description: 'Remove a note',
    schema: z.object({
      idx: z.number().describe('Index to remove'),
    }),
  },
  [StrategyAgentTool.AddPlatform]: {
    name: StrategyAgentTool.AddPlatform,
    description: 'Add a platform',
    schema: z.object({
      value: z.enum(PlatformType).describe('New platform'),
      idx: z.number().describe('Index to insert at'),
    }),
  },
  [StrategyAgentTool.RemovePlatform]: {
    name: StrategyAgentTool.RemovePlatform,
    description: 'Remove a platform',
    schema: z.object({
      idx: z.number().describe('Index to remove'),
    }),
  },
  [StrategyAgentTool.UpdatePlatformNote]: {
    name: StrategyAgentTool.UpdatePlatformNote,
    description: 'Update a platform note',
    schema: z.object({
      key: z.enum(PlatformType).describe('Platform name'),
      value: z.string().describe('New platform note value'),
    }),
  },
  [StrategyAgentTool.AddUnresolvedQuestion]: {
    name: StrategyAgentTool.AddUnresolvedQuestion,
    description: 'Add an unresolved question',
    schema: z.object({
      value: z.string().describe('New unresolved question'),
      idx: z.number().describe('Index to insert at'),
    }),
  },
  [StrategyAgentTool.RemoveUnresolvedQuestion]: {
    name: StrategyAgentTool.RemoveUnresolvedQuestion,
    description: 'Remove an unresolved question',
    schema: z.object({
      idx: z.number().describe('Index to remove'),
    }),
  },
  [StrategyAgentTool.AddVoiceAdjustment]: {
    name: StrategyAgentTool.AddVoiceAdjustment,
    description: 'Add a voice adjustment',
    schema: z.object({
      value: z.string().describe('New voice adjustment'),
      idx: z.number().describe('Index to insert at'),
    }),
  },
  [StrategyAgentTool.RemoveVoiceAdjustment]: {
    name: StrategyAgentTool.RemoveVoiceAdjustment,
    description: 'Remove a voice adjustment',
    schema: z.object({
      idx: z.number().describe('Index to remove'),
    }),
  },
  [StrategyAgentTool.LinkTheme]: {
    name: StrategyAgentTool.LinkTheme,
    description: 'Link a theme to the strategy',
    schema: z.object({
      value: z.uuidv4().describe('Theme ID to link'),
    }),
  },
  [StrategyAgentTool.UnlinkTheme]: {
    name: StrategyAgentTool.UnlinkTheme,
    description: 'Unlink a theme from the strategy',
    schema: z.object({
      id: z.uuidv4().describe('Theme ID to unlink'),
    }),
  },
  [StrategyAgentTool.UpdateTheme]: {
    name: StrategyAgentTool.UpdateTheme,
    description: 'Update the linked theme properties',
    schema: z.object({
      id: z.uuidv4().describe('Theme ID to update'),
      name: z.string().optional().describe('Updated theme name'),
      description: z.string().optional().describe('Updated theme description'),
    }),
  },
  [StrategyAgentTool.CreateTheme]: {
    name: StrategyAgentTool.CreateTheme,
    description: 'Create a new theme and link it to the strategy',
    schema: z.object({
      name: z.string().describe('Name of the new theme'),
      description: z.string().describe('Description of the new theme'),
    }),
  },
  [StrategyAgentTool.CreateVoice]: {
    name: StrategyAgentTool.CreateVoice,
    description: 'Create a new voice and link it to the strategy',
    schema: z.object({
      name: z.string().describe('Name of the new voice'),
      description: z.string().describe('Description of the new voice'),
      rules: z.array(z.string()).describe('Rules for the new voice'),
      avoidRules: z.array(z.string()).describe('Avoid rules for the new voice'),
      tov: z.string().describe('Tone of voice for the new voice'),
      evidencePreferences: z
        .string()
        .describe('Evidence preferences for the new voice'),
      anglePreferences: z
        .string()
        .describe('Angle preferences for the new voice'),
    }),
  },
  [StrategyAgentTool.UpdateVoice]: {
    name: StrategyAgentTool.UpdateVoice,
    description: 'Update the linked voice properties',
    schema: z.object({
      name: z.string().describe('New voice name'),
      description: z.string().describe('New voice description'),
      rules: z.array(z.string()).describe('New voice rules'),
      avoidRules: z.array(z.string()).describe('New voice avoid rules'),
      tov: z.string().describe('New voice tone of voice'),
      evidencePreferences: z
        .string()
        .describe('New voice evidence preferences'),
      anglePreferences: z.string().describe('New voice angle preferences'),
    }),
  },
  [StrategyAgentTool.LinkVoice]: {
    name: StrategyAgentTool.LinkVoice,
    description: 'Link an existing voice to the strategy',
    schema: z.object({
      id: z.uuidv4().describe('Voice ID to link'),
    }),
  },
  [StrategyAgentTool.UpdateContext]: {
    name: StrategyAgentTool.UpdateContext,
    description: 'Update strategy context field',
    schema: z.object({
      block: z.enum(StrategyContextBlockType).describe('Context block name'),
      field: z.string().describe('Context block field name'),
      value: z
        .string()
        .or(z.array(z.string()))
        .describe(
          'New full value for the context field (string or array of strings, depending on the field)',
        ),
    }),
  },
  [StrategyAgentTool.QueryThemes]: {
    name: StrategyAgentTool.QueryThemes,
    description: 'Query database for existing user themes',
    schema: z.void(),
  },
  [StrategyAgentTool.QueryVoices]: {
    name: StrategyAgentTool.QueryVoices,
    description: 'Query database for existing user voices',
    schema: z.void(),
  },
};
