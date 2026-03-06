import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class RootController {
  constructor() {}

  @Get('/health')
  async healthCheck() {
    return { status: 'OK' };
  }
}
