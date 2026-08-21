import { Injectable } from '@nestjs/common';

import { AppError } from '@/common/errors/app-error';

import {
  QaFlowCatalogItem,
  QaFlowDefinition,
  QaFlowMapContext,
  findPriorArtifact,
  latestArtifacts,
  selectionId,
} from './qa-flow.types';

const STRATEGY_TURN_DEFAULTS = [
  'I want a clearer content strategy grounded in how I actually work, not generic founder advice.',
  'My audience is early-stage founders. I publish on X, LinkedIn, and Telegram.',
  'I want to write about product execution, distribution, and founder psychology without cliché.',
];

function strategyIdFrom(ctx: QaFlowMapContext): string | undefined {
  return (
    findPriorArtifact(ctx.priorSteps, 'strategy') ??
    (typeof ctx.initialInput.strategyId === 'string'
      ? ctx.initialInput.strategyId
      : undefined)
  );
}

function voiceIdFrom(ctx: QaFlowMapContext): string | undefined {
  return (
    findPriorArtifact(ctx.priorSteps, 'voice') ??
    (typeof ctx.initialInput.voiceId === 'string'
      ? ctx.initialInput.voiceId
      : undefined)
  );
}

const NOTES_TO_IDEAS: QaFlowDefinition = {
  key: 'notes_to_ideas',
  label: 'Notes → Ideas',
  description: 'Generate ideas from selected notes and optionally pick one.',
  status: 'ready',
  steps: [
    {
      key: 'ideas',
      capabilityKey: 'ideas.suggest',
      requiresSelection: 'idea',
      mapInput: (ctx) => ({ ...ctx.initialInput }),
    },
  ],
};

const NOTES_TO_IDEA_TO_POST: QaFlowDefinition = {
  key: 'notes_to_idea_to_post',
  label: 'Notes → Idea → Post',
  description: 'Generate ideas, select one, create a post, then refine it.',
  status: 'ready',
  steps: [
    {
      key: 'ideas',
      capabilityKey: 'ideas.suggest',
      requiresSelection: 'idea',
      mapInput: (ctx) => ({ ...ctx.initialInput }),
    },
    {
      key: 'post_create',
      capabilityKey: 'post.create',
      mapInput: (ctx) => {
        const ideaId = selectionId(ctx.priorSteps[ctx.priorSteps.length - 1]);
        return {
          ...ctx.initialInput,
          ideaId,
          noteIds: ctx.initialInput.noteIds,
        };
      },
    },
    {
      key: 'post_refine',
      capabilityKey: 'post.refine',
      mapInput: (ctx) => ({
        postId: latestArtifacts(ctx.priorSteps[ctx.priorSteps.length - 1])
          .postId,
        request:
          (ctx.initialInput.refineRequest as string | undefined) ??
          'Write the post',
      }),
    },
  ],
};

const STRATEGY_GUIDED: QaFlowDefinition = {
  key: 'strategy_guided_conversation',
  label: 'Strategy conversation',
  description: 'Create or select a strategy, then run three editable turns.',
  status: 'ready',
  steps: [
    {
      key: 'strategy_create',
      capabilityKey: 'strategy.create',
      optional: true,
      autoSkip: (input) => typeof input.strategyId === 'string',
      mapInput: (ctx) => ({
        name: ctx.initialInput.name,
      }),
    },
    ...STRATEGY_TURN_DEFAULTS.map((content, index) => ({
      key: `strategy_turn_${index + 1}`,
      capabilityKey: 'strategy.message',
      optional: index > 0,
      defaultInput: { content },
      mapInput: (ctx: QaFlowMapContext) => ({
        strategyId: strategyIdFrom(ctx),
        content:
          (ctx.initialInput[`turn${index + 1}`] as string | undefined) ??
          content,
      }),
    })),
  ],
};

const STRATEGY_TO_IDEAS_TO_POST: QaFlowDefinition = {
  key: 'strategy_to_ideas_to_post',
  label: 'Strategy → Ideas → Post',
  description:
    'Shape strategy, generate ideas, select one, then create and refine a post.',
  status: 'ready',
  steps: [
    {
      key: 'strategy_create',
      capabilityKey: 'strategy.create',
      optional: true,
      autoSkip: (input) => typeof input.strategyId === 'string',
      mapInput: (ctx) => ({ name: ctx.initialInput.name }),
    },
    ...STRATEGY_TURN_DEFAULTS.map((content, index) => ({
      key: `strategy_turn_${index + 1}`,
      capabilityKey: 'strategy.message',
      optional: true,
      defaultInput: { content },
      mapInput: (ctx: QaFlowMapContext) => ({
        strategyId: strategyIdFrom(ctx),
        content:
          (ctx.initialInput[`turn${index + 1}`] as string | undefined) ??
          content,
      }),
    })),
    {
      key: 'ideas',
      capabilityKey: 'ideas.suggest',
      requiresSelection: 'idea',
      mapInput: (ctx) => ({
        ...ctx.initialInput,
        strategyId: strategyIdFrom(ctx),
      }),
    },
    {
      key: 'post_create',
      capabilityKey: 'post.create',
      mapInput: (ctx) => ({
        ...ctx.initialInput,
        ideaId: selectionId(ctx.priorSteps[ctx.priorSteps.length - 1]),
        strategyId: strategyIdFrom(ctx),
      }),
    },
    {
      key: 'post_refine',
      capabilityKey: 'post.refine',
      mapInput: (ctx) => ({
        postId: latestArtifacts(ctx.priorSteps[ctx.priorSteps.length - 1])
          .postId,
        request:
          (ctx.initialInput.refineRequest as string | undefined) ??
          'Write the post',
      }),
    },
  ],
};

const VOICE_CALIBRATION_TO_POST: QaFlowDefinition = {
  key: 'voice_calibration_to_post',
  label: 'Voice calibration → Post',
  description:
    'Start voice calibration, optionally send feedback, then create and refine a post.',
  status: 'ready',
  steps: [
    {
      key: 'calibration_start',
      capabilityKey: 'voice.calibration_start',
      mapInput: (ctx) => ({
        voiceId: voiceIdFrom(ctx),
      }),
    },
    {
      key: 'calibration_feedback',
      capabilityKey: 'voice.calibration_feedback',
      optional: true,
      mapInput: (ctx) => ({
        voiceId: voiceIdFrom(ctx),
        feedback: ctx.initialInput.feedback,
      }),
    },
    {
      key: 'post_create',
      capabilityKey: 'post.create',
      mapInput: (ctx) => ({
        ...ctx.initialInput,
        voiceId: voiceIdFrom(ctx),
      }),
    },
    {
      key: 'post_refine',
      capabilityKey: 'post.refine',
      mapInput: (ctx) => ({
        postId: latestArtifacts(ctx.priorSteps[ctx.priorSteps.length - 1])
          .postId,
        request:
          (ctx.initialInput.refineRequest as string | undefined) ??
          'Write the post',
      }),
    },
  ],
};

const FLOWS: QaFlowDefinition[] = [
  NOTES_TO_IDEAS,
  NOTES_TO_IDEA_TO_POST,
  STRATEGY_GUIDED,
  STRATEGY_TO_IDEAS_TO_POST,
  VOICE_CALIBRATION_TO_POST,
];

@Injectable()
export class QaFlowRegistry {
  private readonly byKey = new Map<string, QaFlowDefinition>();

  constructor() {
    for (const flow of FLOWS) {
      if (this.byKey.has(flow.key)) {
        throw new Error(`Duplicate QA flow key: ${flow.key}`);
      }
      if (!flow.steps.length) {
        throw new Error(`QA flow ${flow.key} has no steps`);
      }
      const stepKeys = new Set<string>();
      for (const step of flow.steps) {
        if (stepKeys.has(step.key)) {
          throw new Error(
            `Duplicate step key ${step.key} in flow ${flow.key}`,
          );
        }
        stepKeys.add(step.key);
      }
      this.byKey.set(flow.key, flow);
    }
  }

  list(): QaFlowCatalogItem[] {
    return FLOWS.map((flow) => ({
      key: flow.key,
      label: flow.label,
      description: flow.description,
      status: flow.status,
      steps: flow.steps.map((step) => step.capabilityKey),
    }));
  }

  get(key: string): QaFlowDefinition {
    const flow = this.byKey.get(key);
    if (!flow) {
      throw new AppError('QA_CAPABILITY_UNKNOWN', `Unknown flow: ${key}`, {
        key,
      });
    }
    return flow;
  }
}

export function buildFlowMapContext(params: {
  steps: QaFlowMapContext['steps'];
  currentKey: string;
  initialInput: Record<string, unknown>;
}): QaFlowMapContext {
  const index = params.steps.findIndex((item) => item.key === params.currentKey);
  if (index < 0) {
    throw new AppError('QA_STEP_STATE_INVALID', 'Current flow step not found');
  }
  return {
    initialInput: params.initialInput,
    steps: params.steps,
    current: params.steps[index],
    priorSteps: params.steps.slice(0, index),
  };
}
