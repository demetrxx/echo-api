import { z } from 'zod';

export const qaProfileIdentitySchema = z
  .object({
    name: z.string().optional(),
    age: z.union([z.number(), z.string()]).optional(),
    role: z.string().optional(),
    audience: z.string().optional(),
    platforms: z.array(z.string()).optional(),
    writes_to: z.array(z.string()).optional(),
    writesTo: z.array(z.string()).optional(),
  })
  .passthrough();

export const qaProfileDefinitionSchema = z
  .object({
    profile: qaProfileIdentitySchema.optional(),
    goals: z.array(z.string()).default([]),
    pillars: z.array(z.string()).default([]),
    toneRules: z.array(z.string()).default([]),
    strategyState: z
      .union([z.array(z.string()), z.record(z.string(), z.unknown())])
      .default([]),
    notes: z
      .object({
        raw: z.array(z.string()).default([]),
        noisy: z.array(z.string()).default([]),
      })
      .default({ raw: [], noisy: [] }),
    postSamples: z
      .array(
        z.object({
          id: z
            .union([z.string(), z.number()])
            .optional()
            .transform((value) =>
              value === undefined || value === null ? undefined : String(value),
            ),
          text: z.string().min(1),
        }),
      )
      .default([]),
    expectedTasks: z.array(z.unknown()).default([]),
  })
  .passthrough();

export type CanonicalQaProfileDefinition = z.infer<
  typeof qaProfileDefinitionSchema
>;

const MAX_DEFINITION_CHARS = 400_000;

export function parseQaProfileDefinition(
  value: unknown,
): CanonicalQaProfileDefinition {
  const serialized = JSON.stringify(value ?? {});
  if (serialized.length > MAX_DEFINITION_CHARS) {
    throw new Error('Profile definition is too large');
  }

  return qaProfileDefinitionSchema.parse(value ?? {});
}
