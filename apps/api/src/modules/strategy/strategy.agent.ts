import { StrategyContextBlockType, StrategyStage } from '@app/db';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { createAgent } from 'langchain';
import { DataSource } from 'typeorm';

import { LlmService } from '@/modules/llm';

import { STAGE_TOOLS, StrategyAgentTool } from './consts';
import { buildTool, cleanMessages, getContextBlockDefault } from './lib';
import { STRATEGY_SYSTEM_PROMPT } from './prompts';
import { StrategyAgentState } from './types';

@Injectable()
export class StrategyAgent {
  private readonly logger = new Logger(StrategyAgent.name);

  constructor(
    private readonly llmService: LlmService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async process(state: StrategyAgentState) {
    const tools = this.buildTools(state);

    const agent = createAgent({
      model: this.llmService.client,
      tools,
      systemPrompt: STRATEGY_SYSTEM_PROMPT({
        snapshot: state.snapshot,
        currentStage: state.stage,
        themes: state.themes,
        voice: state.voice,
      }),
    });

    const response = await agent.invoke({
      // @ts-expect-error is ok
      messages: [
        ...state.history,
        {
          role: 'user',
          content: state.userMessage,
        },
      ],
    });

    state.history = cleanMessages(response.messages);
  }

  private buildTools(state: StrategyAgentState) {
    const availableTools = STAGE_TOOLS[state.stage];

    return availableTools.map((toolName) =>
      buildTool(state, toolName, this.getCustomAction(toolName)),
    );
  }

  // actions
  private getCustomAction(toolName: StrategyAgentTool) {
    switch (toolName) {
      case StrategyAgentTool.AddContextBlock:
        return this.action_addContextBlock.bind(this);
      case StrategyAgentTool.RemoveContextBlock:
        return this.action_removeContextBlock.bind(this);
      case StrategyAgentTool.ChangeStage:
        return this.action_changeStage.bind(this);
      default:
        return undefined;
    }
  }

  private action_addContextBlock(
    state: StrategyAgentState,
    i: { value: StrategyContextBlockType },
  ) {
    state.snapshot.context[i.value] = getContextBlockDefault(i.value) as any;
  }

  private action_removeContextBlock(
    state: StrategyAgentState,
    i: { idx: number },
  ) {
    const value = state.snapshot.contextBlocks[i.idx];

    if (!value) {
      throw new Error('Context block not found at index ' + i.idx);
    }

    if (!state.snapshot.context[value]) {
      throw new Error('Context block value not found: ' + value);
    }

    delete state.snapshot.context[value];
  }

  private action_changeStage(
    state: StrategyAgentState,
    i: { value: StrategyStage },
  ) {
    state.stage = i.value;
  }

  private action_linkTheme(state: StrategyAgentState, i: { id: string }) {
    if (state.themes.find((t) => t.id === i.id)) {
      this.logger.error(`Theme with id ${i.id} is already in strategy themes`);
      return;
    }

    state.updates.themesToAdd.push(i.id);
  }

  private action_unlinkTheme(state: StrategyAgentState, i: { id: string }) {
    if (!state.themes.find((t) => t.id === i.id)) {
      this.logger.error(`Theme with id ${i.id} is not in strategy themes`);
      return;
    }

    state.updates.themesToRemove.push(i.id);
  }

  private action_createTheme(state: StrategyAgentState, i: { value: string }) {
    // we create a theme with the given name and link it to the strategy
  }

  private action_linkVoice(state: StrategyAgentState, i: { id: string }) {
    state.updates.voiceToSet = i.id;
  }
}
