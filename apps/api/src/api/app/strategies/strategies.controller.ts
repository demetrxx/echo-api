import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Protected, User } from '@/modules/auth';
import { StrategyService } from '@/modules/strategy';

import {
  GetStrategyQueryParams,
  MessageAgentRequestDto,
  StrategyDetailsDto,
  StrategyDto,
  UpdateStrategyRequestDto,
} from './dtos';

@ApiTags('App / Strategies')
@Controller()
@Protected()
export class StrategiesAppController {
  constructor(private readonly strategyService: StrategyService) {}

  @Get()
  async getMany(@User() user: User, @Query() query: GetStrategyQueryParams) {
    const { data, total, skip, take } = await this.strategyService.getMany(
      user.id,
      query,
    );

    return {
      total,
      data: data.map(StrategyDto.mapFromEntity),
      skip,
      take,
    };
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @User() user: User) {
    const strategy = await this.strategyService.getOne(id, user.id);

    return StrategyDetailsDto.mapFromEntity(strategy);
  }

  @Post()
  async create(@User() user: User) {
    return this.strategyService.create(user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateStrategyRequestDto,
    @User() user: User,
  ) {
    await this.strategyService.updateOne(id, user.id, body);
    return { success: true };
  }

  @Post(':id/message')
  async messageAgent(
    @Param('id') id: string,
    @Body() body: MessageAgentRequestDto,
    @User() user: User,
  ) {
    return this.strategyService.messageAgent(id, user.id, body);
  }
}
