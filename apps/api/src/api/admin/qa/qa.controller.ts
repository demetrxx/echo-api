import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { QaProtected } from '@/modules/qa';
import { QaCapabilityRegistry } from '@/modules/qa/execution/qa-capability.registry';
import { QaContextService } from '@/modules/qa/execution/qa-context.service';
import { QaFlowRegistry } from '@/modules/qa/execution/qa-flow.registry';

import { PreviewQaContextRequestDto } from './dtos';
import {
  ListQaCapabilitiesOpenApi,
  PreviewQaContextOpenApi,
} from './qa.openapi';

@ApiTags('Admin / QA')
@Controller()
@QaProtected()
export class QaCatalogController {
  constructor(
    private readonly registry: QaCapabilityRegistry,
    private readonly flowRegistry: QaFlowRegistry,
    private readonly contextService: QaContextService,
  ) {}

  @ListQaCapabilitiesOpenApi()
  @Get('capabilities')
  catalog() {
    return {
      ...this.registry.listCatalog(),
      flows: this.flowRegistry.list(),
    };
  }

  @PreviewQaContextOpenApi()
  @Post('context/preview')
  preview(@Body() body: PreviewQaContextRequestDto) {
    return this.contextService.preview(body);
  }
}
