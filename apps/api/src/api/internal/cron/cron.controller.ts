import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ExternalService, Internal } from '../common';
import { ExpirePaymentsOpenApi } from './cron.openapi';

@ApiTags('Internal / Cron')
@Internal(ExternalService.CRON)
@Controller('/')
export class CronController {
  constructor() {}

  // @Post('/payments/expire')
  // @ExpirePaymentsOpenApi()
  // async expirePayments(): Promise<{ expiredCount: number }> {
  //   const expiredCount = await this.paymentsService.expireStalePayments();
  //
  //   return { expiredCount };
  // }
}
