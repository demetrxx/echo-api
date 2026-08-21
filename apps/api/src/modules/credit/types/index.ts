import { CreditPaymentType } from '@app/db';

export type CreditPaymentPayload = {
  [CreditPaymentType.Strategy]: {
    strategyId: string;
  };
  [CreditPaymentType.Idea]: {
    ideaId: string;
  };
  [CreditPaymentType.Post]: {
    postId: string;
  };
  [CreditPaymentType.Voice]: {
    voiceId: string;
  };
};

export type CreditPaymentFindPayload<T extends CreditPaymentType> =
  T extends CreditPaymentType.Strategy
    ? {
        strategyId: string;
      }
    : T extends CreditPaymentType.Idea
      ? {
          ideaId: string;
        }
      : T extends CreditPaymentType.Post
        ? {
            postId: string;
          }
        : T extends CreditPaymentType.Voice
          ? {
              voiceId: string;
            }
          : never;
