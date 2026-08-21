import { CreditPaymentType } from '@app/db';

export { CreditPaymentType };

export const CREDIT_PAYMENT_PRICE: Record<CreditPaymentType, number> = {
  [CreditPaymentType.Strategy]: 10,
  [CreditPaymentType.Idea]: 1,
  [CreditPaymentType.Post]: 1,
  [CreditPaymentType.Voice]: 5,
};
