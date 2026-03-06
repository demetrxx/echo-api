import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { ThemeModule } from '@/modules/theme';

import { ThemesAppController } from './themes.controller';

@Module({
  imports: [AuthModule, ThemeModule],
  controllers: [ThemesAppController],
})
export class ThemesApiModule {}
