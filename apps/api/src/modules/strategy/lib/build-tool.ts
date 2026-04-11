import { StrategySnapshot } from '@app/db';
import { tool } from 'langchain';

import { StrategyAgentTool, StrategyAgentToolInfo } from '../consts';
import { StrategyAgentState } from '../types';

enum ToolType {
  ArrayAdd = 'arrayAdd',
  ArrayRemove = 'arrayRemove',
  StringUpdate = 'stringUpdate',
  ObjectUpdate = 'objectUpdate',
  QueryDb = 'queryDatabase',
  Custom = 'custom',
}

const TOOL_TO_FIELD: Record<StrategyAgentTool, keyof StrategySnapshot | null> =
  {
    [StrategyAgentTool.UpdateAudience]: 'audience',
    [StrategyAgentTool.AddProblem]: 'problems',
    [StrategyAgentTool.RemoveProblem]: 'problems',
    [StrategyAgentTool.AddGoal]: 'goals',
    [StrategyAgentTool.RemoveGoal]: 'goals',
    [StrategyAgentTool.AddUnresolvedQuestion]: 'unresolvedQuestions',
    [StrategyAgentTool.RemoveUnresolvedQuestion]: 'unresolvedQuestions',
    [StrategyAgentTool.AddContextBlock]: 'contextBlocks',
    [StrategyAgentTool.RemoveContextBlock]: 'contextBlocks',
    [StrategyAgentTool.AddNote]: 'notes',
    [StrategyAgentTool.RemoveNote]: 'notes',
    [StrategyAgentTool.ChangeStage]: null,
    [StrategyAgentTool.UpdatePlatformNote]: 'platformNotes',
    [StrategyAgentTool.AddVoiceAdjustment]: 'voiceAdjustments',
    [StrategyAgentTool.RemoveVoiceAdjustment]: 'voiceAdjustments',
    [StrategyAgentTool.AddPlatform]: 'platforms',
    [StrategyAgentTool.RemovePlatform]: 'platforms',

    [StrategyAgentTool.QueryThemes]: null,
    [StrategyAgentTool.LinkTheme]: null,
    [StrategyAgentTool.UnlinkTheme]: null,
    [StrategyAgentTool.CreateTheme]: null,
    [StrategyAgentTool.UpdateTheme]: null,

    [StrategyAgentTool.QueryVoices]: null,
    [StrategyAgentTool.CreateVoice]: null,
    [StrategyAgentTool.UpdateVoice]: null,
    [StrategyAgentTool.LinkVoice]: null,

    [StrategyAgentTool.UpdateContext]: null,
  };

const TOOL_TYPE_TO_BUILDER: Record<StrategyAgentTool, ToolType> = {
  [StrategyAgentTool.UpdateAudience]: ToolType.StringUpdate,
  [StrategyAgentTool.AddProblem]: ToolType.ArrayAdd,
  [StrategyAgentTool.RemoveProblem]: ToolType.ArrayRemove,
  [StrategyAgentTool.AddGoal]: ToolType.ArrayAdd,
  [StrategyAgentTool.RemoveGoal]: ToolType.ArrayRemove,
  [StrategyAgentTool.AddUnresolvedQuestion]: ToolType.ArrayAdd,
  [StrategyAgentTool.RemoveUnresolvedQuestion]: ToolType.ArrayRemove,
  [StrategyAgentTool.AddContextBlock]: ToolType.ArrayAdd,
  [StrategyAgentTool.RemoveContextBlock]: ToolType.ArrayRemove,
  [StrategyAgentTool.AddNote]: ToolType.ArrayAdd,
  [StrategyAgentTool.RemoveNote]: ToolType.ArrayRemove,
  [StrategyAgentTool.UpdatePlatformNote]: ToolType.ObjectUpdate,
  [StrategyAgentTool.AddVoiceAdjustment]: ToolType.ArrayAdd,
  [StrategyAgentTool.RemoveVoiceAdjustment]: ToolType.ArrayRemove,
  [StrategyAgentTool.AddPlatform]: ToolType.ArrayAdd,
  [StrategyAgentTool.RemovePlatform]: ToolType.ArrayRemove,

  [StrategyAgentTool.ChangeStage]: ToolType.Custom,

  [StrategyAgentTool.QueryThemes]: ToolType.QueryDb,
  [StrategyAgentTool.LinkTheme]: ToolType.Custom,
  [StrategyAgentTool.UnlinkTheme]: ToolType.Custom,
  [StrategyAgentTool.CreateTheme]: ToolType.Custom,
  [StrategyAgentTool.UpdateTheme]: ToolType.Custom,

  [StrategyAgentTool.QueryVoices]: ToolType.QueryDb,
  [StrategyAgentTool.CreateVoice]: ToolType.Custom,
  [StrategyAgentTool.UpdateVoice]: ToolType.Custom,
  [StrategyAgentTool.LinkVoice]: ToolType.Custom,

  [StrategyAgentTool.UpdateContext]: ToolType.Custom,
};

type ToolCustomAction = (state: StrategyAgentState, input: any) => void;

export function buildTool(
  state: StrategyAgentState,
  toolName: StrategyAgentTool,
  action?: ToolCustomAction,
) {
  const toolType = TOOL_TYPE_TO_BUILDER[toolName];
  const field = TOOL_TO_FIELD[toolName];

  switch (toolType) {
    case ToolType.ArrayAdd:
      return buildArrayItemAddTool(state, field, toolName, action);
    case ToolType.ArrayRemove:
      return buildArrayItemRemoveTool(state, field, toolName, action);
    case ToolType.StringUpdate:
      return buildStringUpdateTool(state, field, toolName, action);
    case ToolType.ObjectUpdate:
      return buildObjectUpdateTool(state, field, toolName, action);
    case ToolType.QueryDb:
      return buildQueryDbTool(state, field, toolName, action);
    case ToolType.Custom:
      return buildCustomTool(state, field, toolName, action);
  }
}

function buildArrayItemAddTool(
  state: StrategyAgentState,
  field: keyof StrategySnapshot,
  toolName: StrategyAgentTool,
  action?: ToolCustomAction,
) {
  return tool((i: { value: string; idx: number }) => {
    if (action) {
      action(state, i);
    }

    (state.snapshot[field] as string[]).splice(i.idx, 0, i.value);
  }, StrategyAgentToolInfo[toolName]);
}

function buildArrayItemRemoveTool(
  state: StrategyAgentState,
  field: keyof StrategySnapshot,
  toolName: StrategyAgentTool,
  action?: ToolCustomAction,
) {
  return tool((i: { idx: number }) => {
    if (action) {
      action(state, i);
    }

    (state.snapshot[field] as string[]).splice(i.idx, 1);
  }, StrategyAgentToolInfo[toolName]);
}

function buildStringUpdateTool(
  state: StrategyAgentState,
  field: keyof StrategySnapshot,
  toolName: StrategyAgentTool,
  action?: ToolCustomAction,
) {
  return tool((i: { value: string }) => {
    if (action) {
      action(state, i);
    }

    (state.snapshot[field] as string) = i.value;
  }, StrategyAgentToolInfo[toolName]);
}

function buildObjectUpdateTool(
  state: StrategyAgentState,
  field: keyof StrategySnapshot,
  toolName: StrategyAgentTool,
  action?: ToolCustomAction,
) {
  return tool((i: { key: string; value: string }) => {
    if (action) {
      action(state, i);
    }

    (state.snapshot[field] as Record<string, string>)[i.key] = i.value;
  }, StrategyAgentToolInfo[toolName]);
}

function buildCustomTool(
  state: StrategyAgentState,
  _field: keyof StrategySnapshot,
  toolName: StrategyAgentTool,
  action?: ToolCustomAction,
) {
  return tool((i: any) => {
    if (action) {
      action(state, i);
    }
  }, StrategyAgentToolInfo[toolName]);
}

function buildQueryDbTool(
  state: StrategyAgentState,
  _field: keyof StrategySnapshot,
  toolName: StrategyAgentTool,
  action?: ToolCustomAction,
) {
  return tool(() => action!(state, undefined), StrategyAgentToolInfo[toolName]);
}
