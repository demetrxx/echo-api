import { StrategyStage } from '@app/db';

interface StrategyStageInfo {
  name: StrategyStage;
  description: string;
  goal: string;
  nextStageTrigger: string;
  guardrails: string[];
}

export const STRATEGY_STAGES: Record<StrategyStage, StrategyStageInfo> = {
  [StrategyStage.Rapport]: {
    name: StrategyStage.Rapport,
    description:
      'Establish the starting context, understand how the user wants to begin, and ask the first strong questions without making the interaction feel like a form.',
    goal: "Identify the user's entry point, gather initial context, and determine whether they are starting from scratch, from notes, from past posts, or from an already formed direction.",
    nextStageTrigger:
      "You understand the user's starting mode and have enough initial context to begin collecting the core inputs for the strategy snapshot.",
    guardrails: [
      'Do not try to finalize the strategy too early.',
      'Do not generate ideas or posts.',
      'Do not ask too many questions at once.',
      'Do not make the interaction feel like an onboarding form.',
    ],
  },
  [StrategyStage.Inventory]: {
    name: StrategyStage.Inventory,
    description:
      'Collect the raw ingredients that will later be distilled into strategy.',
    goal: 'Gather initial information about audience, channels, source material, existing themes, examples, notes, and any rough directional clues the user already has.',
    nextStageTrigger:
      'Gather initial information about audience, channels, source material, existing themes, examples, notes, and any rough directional clues the user already has.',
    guardrails: [
      'Do not over-structure rough answers too early.',
      'Do not force precision where rough context is enough for now.',
      'Do not jump into sharpening or ideation.',
    ],
  },
  [StrategyStage.Distillation]: {
    name: StrategyStage.Distillation,
    description: 'Turn the raw context into clearer strategic building blocks.',
    goal: 'Do not jump into sharpening or ideation.',
    nextStageTrigger:
      'The strategy snapshot contains a usable audience summary, multiple meaningful core problems, and multiple meaningful content goals.',
    guardrails: [
      'Do not settle for generic wording.',
      'Do not create too many weak or redundant items.',
      'Do not move into angles or ideas yet.',
    ],
  },
  [StrategyStage.Structuring]: {
    name: StrategyStage.Structuring,
    description:
      'Convert the distilled understanding into an operational strategy structure that can support future ideation.',

    goal: 'Define or refine channels, active themes, voice, format preferences, evidence preferences, avoid patterns, and other strategic preferences needed for downstream angle and idea generation.',
    nextStageTrigger:
      'Define or refine channels, active themes, voice, format preferences, evidence preferences, avoid patterns, and other strategic preferences needed for downstream angle and idea generation.',
    guardrails: [
      'Do not turn the strategy into a bloated configuration form.',
      'Do not force the user into rigid taxonomies when a synthesized summary is better.',
      'Do not generate ideas or posts yet.',
    ],
  },
  [StrategyStage.TensionCheck]: {
    name: StrategyStage.TensionCheck,
    description:
      'Stress-test the strategy for vagueness, duplication, weak framing, or conflicting directions.',
    goal: 'Sharpen the strategy so it is specific, coherent, and non-generic.',
    nextStageTrigger:
      'Sharpen the strategy so it is specific, coherent, and non-generic.',
    guardrails: [
      'Do not over-polish for style at the expense of truth.',
      'Do not keep refining forever.',
      'Do not rewrite unrelated parts of the strategy unless needed.',
    ],
  },
  [StrategyStage.Readiness]: {
    name: StrategyStage.Readiness,
    description:
      'Decide whether the strategy is complete enough to move into the next stage.',
    goal: 'Do not rewrite unrelated parts of the strategy unless needed.',
    nextStageTrigger:
      'Confirm whether the strategy is ready for angle or idea generation, or identify the last critical gaps that still need clarification.',
    guardrails: [
      'Do not block progress because of minor incompleteness.',
      'Do not block progress because of minor incompleteness.',
      'Do not generate ideas if ideation belongs to a separate screen.',
    ],
  },
  [StrategyStage.Handoff]: {
    name: StrategyStage.Handoff,
    description: 'Prepare the strategy to be used in the next flow.',
    goal: 'Do not generate ideas if ideation belongs to a separate screen.',
    nextStageTrigger:
      'The strategy is in a usable state and the next step has been clearly determined.',
    guardrails: [
      'The strategy is in a usable state and the next step has been clearly determined.',
      'Do not mutate the strategy unnecessarily during handoff.',
      'Do not start writing posts here.',
    ],
  },
  [StrategyStage.FreeRefine]: {
    name: StrategyStage.FreeRefine,
    description:
      'Continue evolving an existing strategy through natural conversation.',
    goal: 'Update the current strategy snapshot based on newly learned context, corrections, or reframing from the user.',
    nextStageTrigger:
      'Update the current strategy snapshot based on newly learned context, corrections, or reframing from the user.',
    guardrails: [
      'Do not change unrelated parts of the snapshot without reason.',
      'Do not assume the user wants a full rebuild when they want a local change.',
      'Do not silently overwrite important existing structure.',
    ],
  },
};
