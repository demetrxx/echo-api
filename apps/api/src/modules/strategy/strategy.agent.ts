import {
  ProfileEntity,
  StrategyContextBlockType,
  StrategyStage,
  ThemeEntity,
} from '@app/db';
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

    const systemPrompt = STRATEGY_SYSTEM_PROMPT({
      snapshot: state.snapshot,
      currentStage: state.stage,
      themes: state.themes,
      voice: state.profile,
    });

    this.logger.log(systemPrompt);

    const agent = createAgent({
      model: this.llmService.client,
      tools,
      systemPrompt,
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
      case StrategyAgentTool.LinkTheme:
        return this.action_linkTheme.bind(this);
      case StrategyAgentTool.UnlinkTheme:
        return this.action_unlinkTheme.bind(this);
      case StrategyAgentTool.CreateTheme:
        return this.action_createTheme.bind(this);
      case StrategyAgentTool.UpdateTheme:
        return this.action_updateTheme.bind(this);
      case StrategyAgentTool.LinkVoice:
        return this.action_linkVoice.bind(this);
      case StrategyAgentTool.CreateVoice:
        return this.action_createVoice.bind(this);
      case StrategyAgentTool.UpdateVoice:
        return this.action_updateVoice.bind(this);
      case StrategyAgentTool.UpdateContext:
        return this.action_updateContext.bind(this);
      case StrategyAgentTool.QueryThemes:
        return this.action_queryThemes.bind(this);
      case StrategyAgentTool.QueryVoices:
        return this.action_queryVoices.bind(this);
      default:
        return undefined;
    }
  }

  private async action_queryThemes(state: StrategyAgentState) {
    const themes = await this.dataSource.getRepository(ThemeEntity).find({
      where: {
        userId: state.userId,
      },
    });

    return JSON.stringify(
      themes.map((i) => ({
        id: i.id,
        name: i.name,
        description: i.description,
      })),
    );
  }

  private async action_queryVoices(state: StrategyAgentState) {
    const themes = await this.dataSource.getRepository(ProfileEntity).find({
      where: { userId: state.userId },
    });

    return JSON.stringify(
      themes.map((i) => ({
        id: i.id,
        name: i.name,
        tov: i.tov,
        examplesSummary: i.examplesSummary,
        anglePreferences: i.anglePreferences,
        rules: i.rules,
        avoidRules: i.avoidRules,
        evidencePreferences: i.evidencePreferences,
      })),
    );
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

    state.updates.themesToLink.push(i.id);
  }

  private action_unlinkTheme(state: StrategyAgentState, i: { id: string }) {
    if (!state.themes.find((t) => t.id === i.id)) {
      this.logger.error(`Theme with id ${i.id} is not in strategy themes`);
      return;
    }

    state.updates.themesToRemove.push(i.id);
  }

  private action_createTheme(
    state: StrategyAgentState,
    i: { name: string; description: string },
  ) {
    state.updates.themesToCreate.push({
      name: i.name,
      description: i.description,
    });
  }

  private action_updateTheme(
    state: StrategyAgentState,
    i: { id: string; name?: string; description?: string },
  ) {
    if (!state.themes.find((t) => t.id === i.id)) {
      this.logger.error(`Theme with id ${i.id} is not in strategy themes`);
      return;
    }

    state.updates.themesToUpdate.push({
      id: i.id,
      name: i.name,
      description: i.description,
    });
  }

  private action_linkVoice(state: StrategyAgentState, i: { id: string }) {
    state.updates.profileToSet = i.id;
  }

  private action_createVoice(
    state: StrategyAgentState,
    i: {
      name: string;
      description: string;
      rules: string[];
      avoidRules: string[];
      tov: string;
      evidencePreferences: string;
      anglePreferences: string;
    },
  ) {
    state.updates.profileToCreate = {
      name: i.name,
      description: i.description,
      rules: i.rules,
      avoidRules: i.avoidRules,
      tov: i.tov,
      evidencePreferences: i.evidencePreferences,
      anglePreferences: i.anglePreferences,
    };
  }

  private action_updateVoice(
    state: StrategyAgentState,
    i: {
      name?: string;
      description?: string;
      rules?: string[];
      avoidRules?: string[];
      tov?: string;
      evidencePreferences?: string;
      anglePreferences?: string;
    },
  ) {
    if (!state.profile) {
      this.logger.error(`No profile linked to strategy, cannot update voice`);
      return;
    }

    state.updates.profileToUpdate = i;
  }

  action_updateContext(
    state: StrategyAgentState,
    i: {
      block: StrategyContextBlockType;
      field: string;
      value: string | string[];
    },
  ) {
    const block = state.snapshot.context[i.block];

    if (!block) {
      this.logger.error(
        `Context block ${i.block} not found in strategy snapshot`,
      );
      return;
    }

    (block as any)[i.field] = i.value;
  }
}
