import { Controller } from '@nestjs/common';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';

import { PaginatedResponse } from '@/common/utils';

@ApiTags('Admin / Users')
@ApiExtraModels(PaginatedResponse)
@Controller()
export class AdminUsersController {
  constructor() {}

  // @GetAllUsersOpenApi()
  // @Get('')
  // @Protected([UserRole.SuperAdmin, UserRole.Admin], Permission.ReadUsers)
  // async getMany(@Query() query: GetUsersQueryParams) {
  //   const { data, total, skip, take } = await this.adminUserService.getMany(
  //     query,
  //     {
  //       search: query.search,
  //       kycStatuses: query.kycStatuses,
  //       hasUnsettled: query.hasUnsettled,
  //       roles: query.roles,
  //     },
  //   );
  //
  //   return {
  //     total,
  //     data: data.map(UserDto.mapFromEntity),
  //     skip,
  //     take,
  //   };
  // }
  //
  // @GetOneUserOpenApi()
  // @Get(':id')
  // @Protected([UserRole.SuperAdmin, UserRole.Admin], Permission.ReadUsers)
  // async getOne(@Param('id') id: string) {
  //   const user = await this.adminUserService.getOne(id);
  //   return UserDto.mapFromEntity(user);
  // }
  //
  // @InviteUserOpenApi()
  // @Protected([UserRole.SuperAdmin, UserRole.Admin], Permission.CreateUsers)
  // @Post('invite')
  // async invite(@Body() body: InviteUserRequestDto) {
  //   const { tempPassword, user } = await this.adminUserService.invite(body);
  //
  //   return { success: true, tempPassword, userId: user.id };
  // }
  //
  // @UpdateUserOpenApi()
  // @Patch(':id')
  // @Protected([UserRole.SuperAdmin, UserRole.Admin], Permission.UpdateUsers)
  // async update(@Param('id') id: string, @Body() body: UpdateUserRequestDto) {
  //   await this.adminUserService.updateOne(id, body);
  //
  //   return { success: true };
  // }
}
