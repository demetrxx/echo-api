import { QaRubricCriterion } from '../types';

export const GROUNDING_RUBRIC: QaRubricCriterion = {
  key: 'grounding',
  label: 'Grounding',
  description: 'Output uses the selected source material.',
  anchors: [
    { score: 2, description: 'Selected notes barely influence the result.' },
    { score: 5, description: 'Theme matches, but the concrete observation is lost.' },
    { score: 8, description: 'At least one result clearly develops a source note.' },
    {
      score: 10,
      description: 'Material is used precisely without unsupported claims.',
    },
  ],
};

export const SPECIFICITY_RUBRIC: QaRubricCriterion = {
  key: 'specificity',
  label: 'Specificity',
  description: 'Result is concrete rather than generic.',
  anchors: [
    { score: 2, description: 'Could belong to anyone.' },
    { score: 5, description: 'Some specifics, mostly generic framing.' },
    { score: 8, description: 'Named details and a clear angle.' },
    { score: 10, description: 'Sharp, particular, and executable.' },
  ],
};

export const IDEAS_RUBRIC: QaRubricCriterion[] = [
  GROUNDING_RUBRIC,
  SPECIFICITY_RUBRIC,
  {
    key: 'novelty',
    label: 'Novelty',
    description: 'Ideas do not repeat each other or obvious history.',
    anchors: [
      { score: 2, description: 'Near-duplicates of the same thought.' },
      { score: 5, description: 'Some overlap, a couple of distinct angles.' },
      { score: 8, description: 'Distinct ideas with limited overlap.' },
      { score: 10, description: 'Each idea opens a different useful direction.' },
    ],
  },
  {
    key: 'strategy_fit',
    label: 'Strategy fit',
    description: 'Result supports the current direction.',
    anchors: [
      { score: 2, description: 'Ignores strategy or fights it.' },
      { score: 5, description: 'Loosely related to the stated direction.' },
      { score: 8, description: 'Clearly serves the current strategy.' },
      { score: 10, description: 'Strengthens the strategy with a usable next step.' },
    ],
  },
  {
    key: 'writeability',
    label: 'Writeability',
    description: 'An idea can become a specific post.',
    anchors: [
      { score: 2, description: 'Too vague to write from.' },
      { score: 5, description: 'A topic, not yet a post.' },
      { score: 8, description: 'Clear enough to draft immediately.' },
      { score: 10, description: 'Almost a post outline already.' },
    ],
  },
];

export const POST_REFINE_RUBRIC: QaRubricCriterion[] = [
  {
    key: 'instruction_fit',
    label: 'Instruction fit',
    description: 'The requested change was actually made.',
    anchors: [
      { score: 2, description: 'Request ignored or reversed.' },
      { score: 5, description: 'Partial or overly broad change.' },
      { score: 8, description: 'Request done without unnecessary rewrite.' },
      { score: 10, description: 'Precise improvement exactly as asked.' },
    ],
  },
  {
    key: 'meaning_preservation',
    label: 'Meaning preservation',
    description: 'The original thought is not replaced.',
    anchors: [
      { score: 2, description: 'Core meaning is gone.' },
      { score: 5, description: 'Meaning is diluted or shifted.' },
      { score: 8, description: 'Original thought remains intact.' },
      { score: 10, description: 'Meaning is sharper and still the author\'s.' },
    ],
  },
  GROUNDING_RUBRIC,
  {
    key: 'voice_fidelity',
    label: 'Voice fidelity',
    description: 'Text matches the voice examples and rules.',
    anchors: [
      { score: 2, description: 'Generic AI voice.' },
      { score: 5, description: 'Some voice traits, mixed with slop.' },
      { score: 8, description: 'Clearly in the user\'s register.' },
      { score: 10, description: 'Indistinguishable from the author\'s writing.' },
    ],
  },
  {
    key: 'writing_quality',
    label: 'Writing quality',
    description: 'Clarity, structure, and concreteness improved.',
    anchors: [
      { score: 2, description: 'Worse or unreadable.' },
      { score: 5, description: 'Mixed: some clarity, some fluff.' },
      { score: 8, description: 'Clearer and better structured.' },
      { score: 10, description: 'Noticeably stronger without extra fat.' },
    ],
  },
];

export const STRATEGY_RUBRIC: QaRubricCriterion[] = [
  {
    key: 'usefulness',
    label: 'Usefulness',
    description: 'The turn helps move strategy forward.',
    anchors: [
      { score: 2, description: 'Filler or circular conversation.' },
      { score: 5, description: 'Mildly useful, still vague.' },
      { score: 8, description: 'A real step forward.' },
      { score: 10, description: 'Unblocks the next decision.' },
    ],
  },
  SPECIFICITY_RUBRIC,
  {
    key: 'stage_discipline',
    label: 'Stage discipline',
    description: 'Does not skip stages or generate posts too early.',
    anchors: [
      { score: 2, description: 'Jumps to writing or ignores the stage.' },
      { score: 5, description: 'Mostly on-stage, some leakage.' },
      { score: 8, description: 'Stays in the current stage.' },
      { score: 10, description: 'Uses the stage to make a precise move.' },
    ],
  },
  {
    key: 'snapshot_quality',
    label: 'Snapshot quality',
    description: 'Structured state is updated accurately and minimally.',
    anchors: [
      { score: 2, description: 'Snapshot unchanged or invented.' },
      { score: 5, description: 'Partial update, important details missing.' },
      { score: 8, description: 'Confirmed data stored cleanly.' },
      {
        score: 10,
        description: 'Snapshot improved without extra or false fields.',
      },
    ],
  },
  {
    key: 'tone',
    label: 'Tone',
    description: 'Dialogue is not a questionnaire or lecture.',
    anchors: [
      { score: 2, description: 'Form-like or preachy.' },
      { score: 5, description: 'Uneven: some good questions, some lecture.' },
      { score: 8, description: 'Natural and focused.' },
      { score: 10, description: 'Calm, specific, and collaborative.' },
    ],
  },
];

export const VOICE_ADAPT_RUBRIC: QaRubricCriterion[] = [
  {
    key: 'voice_fidelity',
    label: 'Voice fidelity',
    description: 'Adapted text matches the voice.',
    anchors: [
      { score: 2, description: 'No recognizable voice.' },
      { score: 5, description: 'Partial match with generic phrasing.' },
      { score: 8, description: 'Clear voice match.' },
      { score: 10, description: 'Sounds like a real sample from this author.' },
    ],
  },
  {
    key: 'meaning_preservation',
    label: 'Meaning preservation',
    description: 'Content meaning is kept.',
    anchors: [
      { score: 2, description: 'Meaning replaced.' },
      { score: 5, description: 'Meaning shifted.' },
      { score: 8, description: 'Meaning kept.' },
      { score: 10, description: 'Meaning kept and made more native.' },
    ],
  },
  {
    key: 'non_caricature',
    label: 'Non-caricature',
    description: 'Voice is not exaggerated into a parody.',
    anchors: [
      { score: 2, description: 'Cartoon version of the author.' },
      { score: 5, description: 'Slightly overplayed.' },
      { score: 8, description: 'Natural intensity.' },
      { score: 10, description: 'Alive without caricature.' },
    ],
  },
  {
    key: 'platform_fit',
    label: 'Platform fit',
    description: 'Adapted text fits the target platform.',
    anchors: [
      { score: 2, description: 'Wrong register for the platform.' },
      { score: 5, description: 'Generic enough to post anywhere.' },
      { score: 8, description: 'Clearly written for this platform.' },
      { score: 10, description: 'Native to the platform without losing the author.' },
    ],
  },
  {
    key: 'naturalness',
    label: 'Naturalness',
    description: 'The result reads like a human wrote it.',
    anchors: [
      { score: 2, description: 'Stiff or obviously generated.' },
      { score: 5, description: 'Mostly readable, some artificial phrasing.' },
      { score: 8, description: 'Natural cadence and word choice.' },
      { score: 10, description: 'Indistinguishable from a real draft.' },
    ],
  },
];

export const VOICE_CALIBRATION_RUBRIC: QaRubricCriterion[] = [
  {
    key: 'profile_accuracy',
    label: 'Profile accuracy',
    description: 'Extracted rules match the examples.',
    anchors: [
      { score: 2, description: 'Wrong or invented profile.' },
      { score: 5, description: 'Some true traits, some noise.' },
      { score: 8, description: 'Mostly accurate profile.' },
      { score: 10, description: 'Precise, evidence-based profile.' },
    ],
  },
  {
    key: 'rule_quality',
    label: 'Rule quality',
    description: 'Positive rules are specific and usable.',
    anchors: [
      { score: 2, description: 'Vague or contradictory rules.' },
      { score: 5, description: 'Some useful rules mixed with generics.' },
      { score: 8, description: 'Specific, actionable rules.' },
      { score: 10, description: 'Sharp rules that would actually steer writing.' },
    ],
  },
  {
    key: 'avoid_rule_quality',
    label: 'Avoid-rule quality',
    description: 'Avoid rules capture real failure modes without over-constraining.',
    anchors: [
      { score: 2, description: 'Missing, invented, or overly broad bans.' },
      { score: 5, description: 'A couple of real avoidances, some noise.' },
      { score: 8, description: 'Clear avoidances grounded in examples.' },
      { score: 10, description: 'Precise avoidances that prevent slop without flattening range.' },
    ],
  },
  {
    key: 'sample_fidelity',
    label: 'Sample fidelity',
    description: 'Generated samples follow the extracted voice.',
    anchors: [
      { score: 2, description: 'Samples ignore the profile.' },
      { score: 5, description: 'Mixed fidelity.' },
      { score: 8, description: 'Samples sound like the author.' },
      { score: 10, description: 'Samples could pass as real posts.' },
    ],
  },
  {
    key: 'non_caricature',
    label: 'Non-caricature',
    description: 'Calibration does not overfit or parody.',
    anchors: [
      { score: 2, description: 'Parody rules or samples.' },
      { score: 5, description: 'Slightly overstated.' },
      { score: 8, description: 'Balanced.' },
      { score: 10, description: 'Subtle and true to range.' },
    ],
  },
];
