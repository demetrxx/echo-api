import { CreditPaymentEntity, CreditPaymentType, UserEntity } from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Err } from '@/common/errors/app-error';

import { User } from '../auth';
import { CREDIT_PAYMENT_PRICE } from './consts';
import { CreditPaymentFindPayload, CreditPaymentPayload } from './types';

@Injectable()
export class CreditService {
  constructor(
    @InjectDataSource()
    private readonly ds: DataSource,
  ) {}

  async consume<T extends CreditPaymentType>(
    user: User,
    type: T,
    payload?: CreditPaymentPayload[T],
  ) {
    const amount = CREDIT_PAYMENT_PRICE[type];

    if (user.credits < amount) {
      const requiredCredits = amount;
      const currentCredits = user.credits;

      let action = 'SUBSCRIBE';

      if (user.isSubscribed) {
        action = 'BUY_CREDITS';
      }

      throw Err.badRequest('Not enough credits', {
        type: 'Not enough credits',
        action,
        requiredCredits,
        currentCredits,
      });
    }

    const newCredits = user.credits - amount;

    await this.ds.getRepository(UserEntity).update(user.id, {
      credits: newCredits,
    });
    user.credits = newCredits;

    return this.ds.getRepository(CreditPaymentEntity).save({
      userId: user.id,
      amount: amount,
      type: type,
      ...(payload || {}),
    });
  }

  async findAndRefund<T extends CreditPaymentType>(
    userId: string,
    type: T,
    payload: CreditPaymentFindPayload<T>,
  ) {
    const creditPayment = await this.find(userId, type, payload);

    if (!creditPayment) {
      throw Err.notFound('Credit payment not found');
    }

    await this.refund(creditPayment);
  }

  async update(
    id: string,
    d: {
      strategyId?: string;
      ideaId?: string;
      postId?: string;
      voiceId?: string;
    },
  ) {
    return this.ds.getRepository(CreditPaymentEntity).update(id, d);
  }

  // Private methods

  async refund(creditPayment: CreditPaymentEntity) {
    await this.ds.getRepository(UserEntity).update(creditPayment.userId, {
      credits: creditPayment.user.credits + creditPayment.amount,
    });

    await this.ds.getRepository(CreditPaymentEntity).update(creditPayment.id, {
      isRefunded: true,
    });
  }

  private async find<T extends CreditPaymentType>(
    userId: string,
    type: T,
    payload: CreditPaymentFindPayload<T>,
  ) {
    return this.ds.getRepository(CreditPaymentEntity).findOne({
      where: {
        userId,
        ...payload,
        type,
      },
      order: { createdAt: 'DESC' },
    });
  }
}
