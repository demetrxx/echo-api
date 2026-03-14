import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Protected, User } from '@/modules/auth';
import { UserService } from '@/modules/user';

import { LinkTelegramRequestDto, UpdateUserRequestDto, UserDto } from './dtos';
import {
  GetUserOpenApi,
  LinkTelegramOpenApi,
  UnlinkTelegramOpenApi,
  UpdateUserOpenApi,
} from './user.openapi';

@ApiTags('App / User')
@Controller()
@Protected()
export class UserAppController {
  constructor(private readonly userService: UserService) {}

  @GetUserOpenApi()
  @Get()
  async getUser(@User() user: User): Promise<UserDto> {
    return this.userService.getOne(user.id);
  }

  @UpdateUserOpenApi()
  @Patch()
  async updateUser(@User() user: User, @Body() body: UpdateUserRequestDto) {
    await this.userService.updateOne(user.id, body);
    return { success: true };
  }

  @LinkTelegramOpenApi()
  @Post('telegram')
  async linkTelegram(@User() user: User, @Body() body: LinkTelegramRequestDto) {
    await this.userService.linkTelegram(user.id, body);
    return { success: true };
  }

  @UnlinkTelegramOpenApi()
  @Delete('telegram')
  async unlinkTelegram(@User() user: User) {
    await this.userService.unlinkTelegram(user.id);
    return { success: true };
  }
}
