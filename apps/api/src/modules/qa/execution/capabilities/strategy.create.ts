import { z } from 'zod';

import { serializeStrategy } from '../../lib/qa-serializers';
import { QaCapabilityDefinition } from '../qa-capability.types';

const inputSchema = z.object({
  name: z.string().min(1).optional(),
});

export const strategyCreateCapability: QaCapabilityDefinition = {
  key: 'strategy.create',
  label: 'Create strategy',
  description: 'Create an initial sandbox strategy and conversation.',
  status: 'support',
  defaultRubric: [],
  allowedNext: ['strategy.message'],
  parseInput: (input) => inputSchema.parse(input ?? {}),
  resolveContext: async ({ input }) => ({
    input: inputSchema.parse(input ?? {}),
    context: [],
    warnings: [],
  }),
  execute: async ({ sandboxUserId, input, services }) => {
    const parsed = inputSchema.parse(input ?? {});
    const strategy = await services.strategyService.create(sandboxUserId);

    if (parsed.name) {
      await services.strategyService.updateOne(strategy.id, sandboxUserId, {
        name: parsed.name,
      });
    }

    const created = await services.strategyService.getOne(
      strategy.id,
      sandboxUserId,
    );

    return {
      output: serializeStrategy(created),
      artifacts: {
        strategyId: created.id,
      },
    };
  },
};
