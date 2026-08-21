export const QA_REVIEW_PROMPT_ID = 'qa-review.v1';

export function buildQaReviewPrompt(params: {
  capabilityKey: string;
  capabilityLabel: string;
  capabilityDescription: string;
  profileExcerpt: Record<string, unknown>;
  rubric: Array<{
    key: string;
    label: string;
    description: string;
    anchors: Array<{ score: number; description: string }>;
  }>;
  input: Record<string, unknown>;
  context: unknown;
  output: unknown;
}): string {
  return [
    'You are a strict QA reviewer for Echo, a content-generation product.',
    'Score the capability output using ONLY the supplied rubric.',
    'Do not invent extra criteria. Do not use any human review.',
    'Scores are integers from 1 to 10.',
    'Return JSON only, no markdown.',
    '',
    `Capability: ${params.capabilityKey} (${params.capabilityLabel})`,
    params.capabilityDescription,
    '',
    'Profile excerpt:',
    JSON.stringify(params.profileExcerpt),
    '',
    'Rubric:',
    JSON.stringify(params.rubric),
    '',
    'Step input:',
    JSON.stringify(params.input),
    '',
    'Resolved context:',
    JSON.stringify(params.context),
    '',
    'Output:',
    JSON.stringify(params.output),
    '',
    'JSON shape:',
    JSON.stringify({
      overallScore: 1,
      criteria: [{ key: 'criterion_key', score: 1, comment: 'why' }],
      comment: 'overall rationale',
      suggestedIssue: 'optional text for a human-created issue, or null',
    }),
  ].join('\n');
}
