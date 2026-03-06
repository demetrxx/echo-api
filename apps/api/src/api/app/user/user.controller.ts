import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Protected, User } from '@/modules/auth';
import { UserService } from '@/modules/user';

import { UpdateUserRequestDto, UserDto } from './dtos';
import { GetUserOpenApi, UpdateUserOpenApi } from './user.openapi';

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
}
