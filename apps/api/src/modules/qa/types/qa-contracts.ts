import { z } from 'zod';

export const qaContextSourceSchema = z.enum([
  'product_default',
  'case',
  'operator_override',
  'prior_step',
]);

export type QaContextSource = z.infer<typeof qaContextSourceSchema>;

export const qaCapabilityStatusSchema = z.enum([
  'ready',
  'limited',
  'deferred',
  'support',
]);

export type QaCapabilityStatus = z.infer<typeof qaCapabilityStatusSchema>;

export const qaRunStatusSchema = z.enum([
  'draft',
  'ready',
  'running',
  'paused',
  'completed',
  'failed',
  'cancelled',
]);

export type QaRunStatusValue = z.infer<typeof qaRunStatusSchema>;

export const qaStepStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'skipped',
]);

export type QaStepStatusValue = z.infer<typeof qaStepStatusSchema>;

export const qaRunActionSchema = z.enum([
  'execute',
  'retry',
  'select_output',
  'continue',
  'skip',
  'finish',
  'cancel',
  'review',
]);

export type QaRunAction = z.infer<typeof qaRunActionSchema>;

export const qaRubricAnchorSchema = z.object({
  score: z.number().int().min(1).max(10),
  description: z.string().min(1),
});

export const qaRubricCriterionSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  anchors: z.array(qaRubricAnchorSchema).min(1),
});

export type QaRubricCriterion = z.infer<typeof qaRubricCriterionSchema>;

export const qaScoreSchema = z.number().int().min(1).max(10);

export const qaContextItemSchema = z.object({
  key: z.string().min(1),
  source: qaContextSourceSchema,
  ids: z.array(z.string().uuid()),
  summary: z.string(),
  details: z.unknown().optional(),
});

export type QaContextItem = z.infer<typeof qaContextItemSchema>;

export const qaContextWarningSchema = z.object({
  code: z.string(),
  message: z.string(),
  blocking: z.boolean(),
});

export type QaContextWarning = z.infer<typeof qaContextWarningSchema>;

export const qaContextPreviewSchema = z.object({
  profileId: z.string().uuid(),
  sandboxUserId: z.string().uuid(),
  capabilityKey: z.string().min(1),
  input: z.record(z.string(), z.unknown()),
  context: z.array(qaContextItemSchema),
  warnings: z.array(qaContextWarningSchema),
  contextHash: z.string().min(1),
});

export type QaContextPreview = z.infer<typeof qaContextPreviewSchema>;

export const qaExecutorResultSchema = z.object({
  output: z.unknown(),
  artifacts: z.record(z.string(), z.unknown()),
  diagnostics: z.record(z.string(), z.unknown()).optional(),
});

export type QaExecutorResult = z.infer<typeof qaExecutorResultSchema>;

export const qaCapabilityCatalogItemSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string(),
  status: qaCapabilityStatusSchema,
  defaultRubric: z.array(qaRubricCriterionSchema),
  allowedNext: z.array(z.string()),
});

export type QaCapabilityCatalogItem = z.infer<
  typeof qaCapabilityCatalogItemSchema
>;

export const QA_RUN_TRANSITIONS: Record<
  QaRunStatusValue,
  QaRunStatusValue[]
> = {
  draft: ['ready', 'cancelled'],
  ready: ['running', 'cancelled', 'completed'],
  running: ['paused', 'completed', 'failed', 'cancelled'],
  paused: ['running', 'completed', 'cancelled', 'ready'],
  completed: [],
  failed: ['ready', 'running', 'cancelled', 'completed'],
  cancelled: [],
};

export const QA_STEP_TRANSITIONS: Record<
  QaStepStatusValue,
  QaStepStatusValue[]
> = {
  pending: ['running', 'skipped'],
  running: ['completed', 'failed'],
  completed: ['pending'],
  failed: ['pending', 'running'],
  skipped: [],
};

export function validateCapabilityRegistry(
  items: QaCapabilityCatalogItem[],
): QaCapabilityCatalogItem[] {
  const parsed = z.array(qaCapabilityCatalogItemSchema).min(1).parse(items);
  const keys = new Set<string>();

  for (const item of parsed) {
    if (keys.has(item.key)) {
      throw new Error(`Duplicate QA capability key: ${item.key}`);
    }
    keys.add(item.key);

    for (const criterion of item.defaultRubric) {
      qaRubricCriterionSchema.parse(criterion);
    }
  }

  return parsed;
}

export function assertRunTransition(
  from: QaRunStatusValue,
  to: QaRunStatusValue,
) {
  if (!QA_RUN_TRANSITIONS[from].includes(to)) {
    throw new Error(`Illegal QA run transition ${from} -> ${to}`);
  }
}

export function assertStepTransition(
  from: QaStepStatusValue,
  to: QaStepStatusValue,
) {
  if (!QA_STEP_TRANSITIONS[from].includes(to)) {
    throw new Error(`Illegal QA step transition ${from} -> ${to}`);
  }
}
