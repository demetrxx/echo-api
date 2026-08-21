import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { QaConfig } from '@/config';
import { IdeaModule } from '@/modules/idea';
import { LlmModule } from '@/modules/llm';
import { NoteModule } from '@/modules/note';
import { PostModule } from '@/modules/post';
import { StrategyModule } from '@/modules/strategy';
import { ThemeModule } from '@/modules/theme';
import { VoiceModule } from '@/modules/voice';

import { QaCapabilityRegistry } from './execution/qa-capability.registry';
import { QaContextService } from './execution/qa-context.service';
import { QaExecutorService } from './execution/qa-executor.service';
import { QaFlowRegistry } from './execution/qa-flow.registry';
import { QaRunService } from './execution/qa-run.service';
import { QaIssueService } from './issues/qa-issue.service';
import { QaMaterializerService } from './materialization/qa-materializer.service';
import { QaProfileService } from './profiles/qa-profile.service';
import { QaSeedAssistantService } from './profiles/qa-seed-assistant.service';
import { QaAdminGuard } from './qa-admin.guard';
import { QaReviewService } from './reviews/qa-review.service';

@Module({
  imports: [
    ConfigModule.forFeature(QaConfig),
    IdeaModule,
    PostModule,
    StrategyModule,
    VoiceModule,
    NoteModule,
    ThemeModule,
    LlmModule,
  ],
  providers: [
    QaAdminGuard,
    QaProfileService,
    QaMaterializerService,
    QaSeedAssistantService,
    QaCapabilityRegistry,
    QaFlowRegistry,
    QaContextService,
    QaExecutorService,
    QaRunService,
    QaReviewService,
    QaIssueService,
  ],
  exports: [
    QaAdminGuard,
    QaProfileService,
    QaMaterializerService,
    QaSeedAssistantService,
    QaCapabilityRegistry,
    QaFlowRegistry,
    QaContextService,
    QaExecutorService,
    QaRunService,
    QaReviewService,
    QaIssueService,
  ],
})
export class QaModule {}
