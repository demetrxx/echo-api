import { Module } from '@nestjs/common';

import { ThemeService } from './theme.service';
import { ThemeStore } from './theme.store';

@Module({
  providers: [ThemeStore, ThemeService],
  exports: [ThemeStore, ThemeService],
})
export class ThemeModule {}
