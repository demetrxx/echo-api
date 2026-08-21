import { Injectable } from '@nestjs/common';
import { ZodError } from 'zod';

import { AppError } from '@/common/errors/app-error';

import { QaExecutorResult, qaExecutorResultSchema } from '../types';
import { QaCapabilityRegistry } from './qa-capability.registry';
import { QaContextService } from './qa-context.service';

@Injectable()
export class QaExecutorService {
  constructor(
    private readonly registry: QaCapabilityRegistry,
    private readonly contextService: QaContextService,
  ) {}

  async execute(params: {
    sandboxUserId: string;
    capabilityKey: string;
    input: Record<string, unknown>;
  }): Promise<QaExecutorResult> {
    await this.contextService.getSandboxUser(params.sandboxUserId);
    const capability = this.registry.get(params.capabilityKey);

    let parsedInput: Record<string, unknown>;
    try {
      parsedInput = capability.parseInput(params.input);
    } catch (error) {
      throw this.toExecutionError(error);
    }

    try {
      const result = await capability.execute({
        sandboxUserId: params.sandboxUserId,
        input: parsedInput,
        services: this.registry.services(),
      });

      return qaExecutorResultSchema.parse(result);
    } catch (error) {
      throw this.toExecutionError(error);
    }
  }

  toExecutionError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof ZodError) {
      return new AppError(
        'QA_EXECUTION_FAILED',
        'Capability input or output failed validation',
        error.issues,
        error,
      );
    }

    return new AppError(
      'QA_EXECUTION_FAILED',
      error instanceof Error ? error.message : 'Capability execution failed',
      undefined,
      error,
    );
  }
}
