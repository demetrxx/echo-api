import { StrategySnapshot, StrategyStage } from '@app/db';
import { BaseMessageLike } from '@langchain/core/messages';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { createAgent, tool } from 'langchain';
import { DataSource } from 'typeorm';

import { LlmService } from '@/modules/llm';

import { StrategyAgentTool, StrategyAgentToolInfo } from './consts';
import { STRATEGY_SYSTEM_PROMPT } from './prompts';

export interface StrategyAgentState {
  snapshot: StrategySnapshot;
  history: BaseMessageLike[];
  stage: StrategyStage;
  userMessage: string;
}

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
      }),
    });

    state.history.push({
      role: 'user',
      content: state.userMessage,
    });

    const response = await agent.invoke(state.history as any);

    state.history.push({
      role: 'assistant',
      content: response.messages[0].content as string,
    });

    this.logger.debug(state.history);
  }

  private buildTools(state: StrategyAgentState) {
    const availableTools = [
      this.updateAudienceSummaryTool,
      this.addCoreProblemTool,
      this.removeCoreProblemTool,
      this.addContentGoalTool,
      this.removeContentGoalTool,
    ];

    // todo: filter tools by stage

    return availableTools.map((t) => t(state));
  }

  updateAudienceSummaryTool(state: StrategyAgentState) {
    return tool((i: { summary: string }) => {
      state.snapshot.audienceSummary = i.summary;
      state.history.push({
        role: 'tool',
        content: `Updated audience summary to: ${i.summary}`,
      });
    }, StrategyAgentToolInfo[StrategyAgentTool.UpdateAudienceSummary]);
  }

  addCoreProblemTool(state: StrategyAgentState) {
    return tool((i: { problem: string; idx: number }) => {
      state.snapshot.coreProblems.splice(i.idx, 0, i.problem);
      state.history.push({
        role: 'tool',
        content: `Added core problem: ${i.problem}`,
      });
    }, StrategyAgentToolInfo[StrategyAgentTool.AddCoreProblem]);
  }

  removeCoreProblemTool(state: StrategyAgentState) {
    return tool((i: { idx: number }) => {
      state.snapshot.coreProblems.splice(i.idx, 1);
      state.history.push({
        role: 'tool',
        content: `Removed core problem: ${i.idx}`,
      });
    }, StrategyAgentToolInfo[StrategyAgentTool.RemoveCoreProblem]);
  }

  addContentGoalTool(state: StrategyAgentState) {
    return tool((i: { goal: string; idx: number }) => {
      state.snapshot.contentGoals.splice(i.idx, 0, i.goal);
      state.history.push({
        role: 'tool',
        content: `Added content goal: ${i.goal}`,
      });
    }, StrategyAgentToolInfo[StrategyAgentTool.AddContentGoal]);
  }

  removeContentGoalTool(state: StrategyAgentState) {
    return tool((i: { idx: number }) => {
      state.snapshot.contentGoals.splice(i.idx, 1);
      state.history.push({
        role: 'tool',
        content: `Removed content goal: ${i.idx}`,
      });
    }, StrategyAgentToolInfo[StrategyAgentTool.RemoveContentGoal]);
  }
}
