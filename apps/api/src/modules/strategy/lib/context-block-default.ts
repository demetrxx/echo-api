import {
  ClarityContextBlock,
  CommunityContextBlock,
  DestinationContextBlock,
  ExpertiseContextBlock,
  GrowthContextBlock,
  IdentityContextBlock,
  JourneyContextBlock,
  OpportunityContextBlock,
  ProductContextBlock,
  StrategyContextBlockType,
} from '@app/db';

export function getContextBlockDefault(type: StrategyContextBlockType) {
  switch (type) {
    case StrategyContextBlockType.Product:
      return baseProductContext();
    case StrategyContextBlockType.Expertise:
      return baseExpertiseContext();
    case StrategyContextBlockType.Growth:
      return baseGrowthContext();
    case StrategyContextBlockType.Identity:
      return baseIdentityContext();
    case StrategyContextBlockType.Community:
      return baseCommunityContext();
    case StrategyContextBlockType.Clarity:
      return baseClarityContext();
    case StrategyContextBlockType.Journey:
      return baseJourneyContext();
    case StrategyContextBlockType.Destination:
      return baseDestinationContext();
    case StrategyContextBlockType.Opportunity:
      return baseOpportunityContext();
  }
}

function baseProductContext(): ProductContextBlock {
  return {
    offerSummary: '',
    productOrService: '',
    transformation: '',
    desiredAction: '',
    objections: [],
    proofNeeded: [],
  };
}

function baseExpertiseContext(): ExpertiseContextBlock {
  return { whatToBeKnownFor: [], proofAreas: [], misconceptionAreas: [] };
}

function baseGrowthContext(): GrowthContextBlock {
  return {
    attentionObjectives: [],
    noveltyPreferences: [],
    antiRepetitionNotes: [],
  };
}

function baseIdentityContext(): IdentityContextBlock {
  return { desiredAssociations: [], worldviewThreads: [], nonNegotiables: [] };
}

function baseCommunityContext(): CommunityContextBlock {
  return {
    desiredInteractionTypes: [],
    conversationStyle: '',
    communityLanguageCues: [],
  };
}

function baseClarityContext(): ClarityContextBlock {
  return { recurringQuestions: [], unresolvedTensions: [], linesOfInquiry: [] };
}

function baseJourneyContext(): JourneyContextBlock {
  return { whatIsBeingDocumented: '', progressArcs: [], updateTypes: [] };
}

function baseDestinationContext(): DestinationContextBlock {
  return { destinations: [], bridgeActions: [], destinationNotes: '' };
}

function baseOpportunityContext(): OpportunityContextBlock {
  return {
    desiredOpportunities: [],
    credibilitySignals: [],
    roleNarrative: '',
  };
}
