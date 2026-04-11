import { PlatformType } from '@app/db';

export enum StrategyContextBlockType {
  Product = 'product',
  Expertise = 'expertise',
  Growth = 'growth',
  Identity = 'identity',
  Community = 'community',
  Clarity = 'clarity',
  Journey = 'journey',
  Destination = 'destination',
  Opportunity = 'opportunity',
}

export interface StrategySnapshot {
  // core
  audience: string; // summary, segments, needs, pain points
  problems: string[];
  goals: string[];
  notes: string[];
  platforms: PlatformType[];
  platformNotes: Partial<Record<PlatformType, string>>;
  unresolvedQuestions: string[];
  voiceAdjustments: string[]; // only if existing voice

  contextBlocks: StrategyContextBlockType[];
  context: {
    product?: ProductContextBlock;
    expertise?: ExpertiseContextBlock;
    growth?: GrowthContextBlock;
    identity?: IdentityContextBlock;
    community?: CommunityContextBlock;
    clarity?: ClarityContextBlock;
    journey?: JourneyContextBlock;
    destination?: DestinationContextBlock;
    opportunity?: OpportunityContextBlock;
  };
}

// ---------- context blocks ----------
/** * Needed when the strategy is sales / lead / offer driven. * Keeps business context out of the generic core unless relevant. */
export interface ProductContextBlock {
  offerSummary: string; // what is being sold / offered
  productOrService: string; // human-readable label
  transformation: string; // what result the offer creates
  desiredAction: string; // what content should lead people to do
  objections: string[]; // recurring objections / hesitations
  proofNeeded: string[]; // what proof this audience needs before acting
}

/** * Needed when the strategy is more trust / expertise / authority oriented. */
export interface ExpertiseContextBlock {
  whatToBeKnownFor: string[]; // the themes or reputational anchors
  proofAreas: string[]; // areas where proof / examples matter
  misconceptionAreas: string[]; // myths / bad assumptions to challenge
}

/** * Needed when growth / attention is a primary objective. */
export interface GrowthContextBlock {
  attentionObjectives: string[]; // e.g. "more reach", "higher saves", "more shares"
  noveltyPreferences: string[]; // what kinds of novelty or framing feel acceptable
  antiRepetitionNotes: string[]; // how to avoid stale repetition
}

/** * Needed when the user is writing to build a recognizable personal brand / identity. */
export interface IdentityContextBlock {
  desiredAssociations: string[]; // what should people associate the user with
  worldviewThreads: string[]; // repeated beliefs / values / angles
  nonNegotiables: string[]; // what must remain true to the user's identity
}

/** * Needed when the user writes to think, clarify, or explore. */
export interface ClarityContextBlock {
  recurringQuestions: string[]; // questions they keep returning to
  unresolvedTensions: string[]; // half-formed tensions worth exploring
  linesOfInquiry: string[]; // directions worth thinking through over time
}

/** * Needed when the user writes to build dialogue / community. */
export interface CommunityContextBlock {
  desiredInteractionTypes: string[]; // what kind of response they want
  conversationStyle: string; // how they like to engage with people
  communityLanguageCues: string[]; // phrases / vocabulary common in that audience
}

/** * Needed when the user is documenting a journey / building in public. */
export interface JourneyContextBlock {
  whatIsBeingDocumented: string; // the process / journey / project
  progressArcs: string[]; // lines of progress worth revisiting
  updateTypes: string[]; // lessons, milestones, failures, tradeoffs, etc.
}

/** * Needed when the blog is meant to move people into an owned channel.*/
export interface DestinationContextBlock {
  destinations: string[]; // newsletter, telegram, waitlist, site, etc.
  bridgeActions: string[]; // actions content should nudge toward
  destinationNotes: string; // extra nuance about the handoff
}

/** * Needed when the goal is career opportunities / reputation-driven outcomes. */
export interface OpportunityContextBlock {
  desiredOpportunities: string[]; // jobs, consulting, speaking, partnerships, etc.
  credibilitySignals: string[]; // what makes the user look legit
  roleNarrative: string; // the professional story they want to reinforce
}
