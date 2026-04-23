import {
  StrategyContextBlockType,
  StrategyStage,
  ThemeEntity,
  VoiceEntity,
} from '@app/db';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { createAgent } from 'langchain';
import { DataSource } from 'typeorm';

import { LlmService } from '@/modules/llm';

import { STAGE_TOOLS, StrategyAgentTool } from './consts';
import { buildTool, cleanMessages } from './lib';
import { STRATEGY_SYSTEM_PROMPT } from './prompts';
import { STRATEGY_NAME_PROMPT } from './prompts';
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
      voice: state.voice,
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

    this.generateName(state);
  }

  async generateName(state: StrategyAgentState) {
    if (state.name) return;

    const hasAudience = !!state.snapshot.audience?.length;
    const hasGoals = !!state.snapshot.goals?.length;
    const hasProblems = !!state.snapshot.problems?.length;
    const hasThemes = !!state.themes?.length;

    // wait until have at least one audience, one goal, and either themes or problems
    if (!hasAudience || !hasGoals || !(hasThemes || hasProblems)) {
      return;
    }

    const response = await this.llmService.fastClient.invoke([
      {
        role: 'user',
        content: STRATEGY_NAME_PROMPT({
          audience: state.snapshot.audience,
          goals: state.snapshot.goals,
          problems: state.snapshot.problems,
          themes: state.themes.map((t) => t.name),
        }),
      },
    ]);

    const name = (response.content as string).trim();

    state.name = name;
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
    const themes = await this.dataSource.getRepository(VoiceEntity).find({
      where: { userId: state.userId },
    });

    return JSON.stringify(
      themes.map((i) => ({
        id: i.id,
        name: i.name,
        tov: i.data.tov,
        rules: i.data.rules,
        avoidRules: i.data.avoidRules,
        evidencePreferences: i.data.evidencePreferences,
      })),
    );
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
    state.updates.voiceToSet = i.id;
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
    state.updates.voiceToCreate = {
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
    if (!state.voice) {
      this.logger.error(`No voice linked to strategy, cannot update voice`);
      return;
    }

    state.updates.voiceToUpdate = i;
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
