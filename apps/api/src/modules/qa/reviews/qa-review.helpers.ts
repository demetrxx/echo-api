import { QaReviewEntity, QaReviewerType } from '@app/db';

export interface QaReviewCriterionScore {
  key: string;
  score: number;
  comment?: string;
}

export interface QaReviewView {
  id: string;
  reviewerType: QaReviewerType;
  stepKey: string | null;
  overallScore: number;
  criteria: QaReviewCriterionScore[];
  comment: string | null;
  reviewerUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface QaStepReviewSummary {
  stepKey: string;
  ai: QaReviewView | null;
  human: QaReviewView | null;
  effectiveScore: number | null;
}

export function mapReviewView(entity: QaReviewEntity): QaReviewView {
  return {
    id: entity.id,
    reviewerType: entity.reviewerType,
    stepKey: entity.stepKey,
    overallScore: entity.overallScore,
    criteria: (entity.criteria ?? []) as QaReviewCriterionScore[],
    comment: entity.comment,
    reviewerUserId: entity.reviewerUserId,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export function summarizeReviews(
  reviews: QaReviewEntity[] | undefined,
): QaStepReviewSummary[] {
  const grouped = new Map<
    string,
    { ai: QaReviewEntity | null; human: QaReviewEntity | null }
  >();

  for (const review of reviews ?? []) {
    const key = review.stepKey ?? '_run';
    const bucket = grouped.get(key) ?? { ai: null, human: null };
    if (review.reviewerType === QaReviewerType.Human) {
      bucket.human = review;
    } else if (
      !bucket.ai ||
      review.createdAt > bucket.ai.createdAt ||
      (review.createdAt.getTime() === bucket.ai.createdAt.getTime() &&
        review.id > bucket.ai.id)
    ) {
      bucket.ai = review;
    }
    grouped.set(key, bucket);
  }

  return [...grouped.entries()].map(([stepKey, bucket]) => ({
    stepKey,
    ai: bucket.ai ? mapReviewView(bucket.ai) : null,
    human: bucket.human ? mapReviewView(bucket.human) : null,
    effectiveScore:
      bucket.human?.overallScore ?? bucket.ai?.overallScore ?? null,
  }));
}
