import {
  StrategyContextBlockType,
  StrategySnapshot,
  StrategyStage,
} from '@app/db';

interface StrategyStageInfo {
  name: StrategyStage;
  description: string;
  goal: string;
  escalationTrigger: string;
  guardrails: string[];

  primaryActions: string[]; // что агент должен делать на этой стадии
  expectedSnapshotEffects: string[]; // какие изменения в snapshot ожидаем как результат

  operationalGuidance: string;
}

interface ContextBlockSelectionRule {
  block: StrategyContextBlockType;
  purpose: string;
  whenToUse: string;
  whenNotToUse: string[];
  strongSignals: string[];
  nearbyBlocks: StrategyContextBlockType[];
}

export const CONTEXT_BLOCK_SELECTION_GUIDANCE = `
Context blocks are a flexible support structure for capturing situational context that materially affects strategy.

Standard context blocks are preferred patterns, not an exhaustive taxonomy.
Prefer using a standard block when it clearly fits.
Use a custom block only when the needed context does not fit any standard block well.

General rules:
- Add context only when it will materially change what the strategy needs to capture.
- Do not add context just because it might be useful later.
- Prefer the smallest amount of context structure needed to preserve what matters.
- If the signal is weak or mixed, ask a clarifying question instead of creating context immediately.
- Nearby blocks are alternatives or secondary candidates, not automatic additions.
`;

export const CONTEXT_BLOCK_USAGE_GUIDANCE = `
When adding or updating context, do not try to exhaustively fill a block.

Use only the fields that materially matter for this case.
Capture the smallest amount of context that will make the strategy more truthful and useful.

Good context is:
- real
- decision-shaping
- specific enough to matter
- minimal enough to stay natural

Do not fill context like a questionnaire.
Do not create fields just because they seem standard.
Do not force completeness when partial but truthful context is enough.
`;

export const CONTEXT_BLOCK_SELECTION_RULES: ContextBlockSelectionRule[] = [
  {
    block: StrategyContextBlockType.Product,
    purpose:
      'Capture what is being offered, what action content should drive, and what buying friction matters.',
    whenToUse:
      'Use when the strategy is meaningfully tied to sales, leads, conversion, or movement toward an offer.',
    strongSignals: [
      'I want clients',
      'I want sales',
      'I want content to lead people to my product or service',
      'I need to address objections before people buy',
      'I sell a service, product, course, or offer',
    ],
    whenNotToUse: [
      'The user is only exploring ideas or clarifying thinking',
      'There is no real offer, action path, or conversion intent yet',
      'Trust-building is present, but product movement is not',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Expertise,
      StrategyContextBlockType.Destination,
    ],
  },

  {
    block: StrategyContextBlockType.Expertise,
    purpose:
      'Capture what the user wants to be known for, where proof matters, and what misconceptions they may need to challenge.',
    whenToUse:
      'Use when the strategy is substantially about trust, authority, credibility, or being recognized for expertise.',
    strongSignals: [
      'I want people to see me as an expert',
      'I want to build trust',
      'I want to be known for a topic',
      'I want to explain complex things clearly',
      'I want to show that I know what I am talking about',
    ],
    whenNotToUse: [
      'The user is mainly writing for expression without authority goals',
      'The strategy is purely transactional and expertise is not part of the value path',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Identity,
      StrategyContextBlockType.Opportunity,
      StrategyContextBlockType.Product,
    ],
  },

  {
    block: StrategyContextBlockType.Growth,
    purpose:
      'Capture how the strategy thinks about attention, reach, discoverability, and acceptable growth tradeoffs.',
    whenToUse:
      'Use when growth, reach, performance, or discoverability is a real objective rather than a minor side effect.',
    strongSignals: [
      'I want more reach',
      'I want to grow my audience',
      'I care about traction',
      'I want more shares, saves, or distribution',
      'I want content that gets picked up more often',
    ],
    whenNotToUse: [
      'Growth is only a nice-to-have',
      'The user mainly cares about clarity, trust, or expression',
      'The user does not care about content performance',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Community,
      StrategyContextBlockType.Destination,
      StrategyContextBlockType.Product,
    ],
  },

  {
    block: StrategyContextBlockType.Identity,
    purpose:
      'Capture how the user wants to be perceived, what should feel unmistakably theirs, and what must remain true in expression.',
    whenToUse:
      'Use when the strategy is substantially about personal brand, recognizability, worldview, or protecting a specific identity in content.',
    strongSignals: [
      'I want to build a personal brand',
      'I want people to associate me with certain ideas',
      'I care a lot about how I sound and what I stand for',
      'I do not want to lose myself in content',
      'I want my voice or worldview to be recognizable',
    ],
    whenNotToUse: [
      'The user only cares about utility, performance, or sales outcomes',
      'Identity is not part of the actual purpose of writing',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Expertise,
      StrategyContextBlockType.Clarity,
      StrategyContextBlockType.Opportunity,
    ],
  },

  {
    block: StrategyContextBlockType.Community,
    purpose:
      'Capture the kind of dialogue, interaction, or audience relationship the user wants to build.',
    whenToUse:
      'Use when the strategy is meaningfully about conversation, belonging, audience closeness, or repeated participation.',
    strongSignals: [
      'I want conversations, not just broadcasting',
      'I want a closer relationship with my audience',
      'I want people to reply and engage',
      'I want to build a community',
      'I care about interaction quality, not just reach',
    ],
    whenNotToUse: [
      'The user mainly wants one-way authority or publishing',
      'The user only cares about growth metrics, not interaction dynamics',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Growth,
      StrategyContextBlockType.Identity,
      StrategyContextBlockType.Destination,
    ],
  },

  {
    block: StrategyContextBlockType.Clarity,
    purpose:
      'Capture the recurring questions, tensions, and lines of inquiry the user is writing to think through.',
    whenToUse:
      'Use when the strategy is substantially about clarifying thinking, exploring ideas, or understanding what the user believes.',
    strongSignals: [
      'I write to clarify my thinking',
      'Writing helps me understand what I believe',
      'I want to explore ideas over time',
      'I keep circling certain questions',
      'I want to structure my thoughts',
    ],
    whenNotToUse: [
      'The user is purely focused on sales or performance outcomes',
      'Thinking clarity is not part of the user’s actual motivation',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Identity,
      StrategyContextBlockType.Journey,
      StrategyContextBlockType.Expertise,
    ],
  },

  {
    block: StrategyContextBlockType.Journey,
    purpose:
      'Capture the ongoing process, progress arcs, and update logic when the strategy includes documenting change over time.',
    whenToUse:
      'Use when the strategy is materially about documenting a process, building in public, or sharing progress over time.',
    strongSignals: [
      'I want to document my journey',
      'I am building in public',
      'I want to share progress over time',
      'I want to post updates, lessons, and tradeoffs',
      'My content follows an ongoing process or project',
    ],
    whenNotToUse: [
      'There is no real time-based process being documented',
      'The user is sharing conclusions only, not an unfolding journey',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Clarity,
      StrategyContextBlockType.Identity,
      StrategyContextBlockType.Expertise,
    ],
  },

  {
    block: StrategyContextBlockType.Destination,
    purpose:
      'Capture where the content should move people next when the strategy depends on an owned destination or handoff.',
    whenToUse:
      'Use when content is meant to bridge people into a newsletter, Telegram, waitlist, website, or another owned destination.',
    strongSignals: [
      'I want people to join my newsletter',
      'I want people to move to Telegram',
      'I want content to drive people to a waitlist or site',
      'I want an owned audience, not just platform followers',
      'I want posts to bridge into another channel',
    ],
    whenNotToUse: [
      'The content has no real downstream destination',
      'The user is not trying to move people anywhere specific',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Product,
      StrategyContextBlockType.Growth,
      StrategyContextBlockType.Community,
    ],
  },

  {
    block: StrategyContextBlockType.Opportunity,
    purpose:
      'Capture the reputation, credibility, and narrative conditions needed to attract valuable external opportunities.',
    whenToUse:
      'Use when the strategy is materially about attracting career, speaking, consulting, hiring, partnership, or reputation-driven opportunities.',
    strongSignals: [
      'I want to attract opportunities',
      'I want people to invite me to speak or consult',
      'I want career upside from my content',
      'I want to be discoverable for partnerships or roles',
      'I want my content to reinforce my professional narrative',
    ],
    whenNotToUse: [
      'The user is only focused on self-expression or thinking clarity',
      'The desired outcome is clearly product conversion instead',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Expertise,
      StrategyContextBlockType.Identity,
      StrategyContextBlockType.Product,
    ],
  },

  {
    block: StrategyContextBlockType.Custom,
    purpose:
      'Capture strategically important situational context that does not fit any standard context block well.',
    whenToUse:
      'Use only when the needed context is clearly real, clearly important, and clearly does not fit the standard blocks without distortion.',
    strongSignals: [
      'The user’s situation is materially shaped by context that does not fit product, expertise, growth, identity, community, clarity, journey, destination, or opportunity',
      'Forcing a standard block would make the strategy less truthful',
    ],
    whenNotToUse: [
      'A standard block already fits well enough',
      'The custom block would only rename an existing standard block',
      'The context is too weak, temporary, or vague to justify its own block',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Product,
      StrategyContextBlockType.Expertise,
      StrategyContextBlockType.Identity,
      StrategyContextBlockType.Clarity,
    ],
  },
];

export const STRATEGY_STAGES: Record<StrategyStage, StrategyStageInfo> = {
  [StrategyStage.Diagnose]: {
    name: StrategyStage.Diagnose,
    description:
      'Understand why the user wants to write, what kind of strategy they need, and whether any additional situational context should be captured before deeper strategy work begins.',
    goal: 'Understand the user’s intent, starting point, channels, and available source material well enough to define the initial strategic direction and decide whether any additional context is materially needed.',
    escalationTrigger:
      'The user’s purpose is clear enough to identify the initial direction of the strategy, capture any obvious early context, such as goals, platforms, or a rough audience summary, where it is already clear, and decide whether any additional situational context should be captured.',
    guardrails: [
      'Do not try to fully define the strategy yet.',
      'Do not generate themes, ideas, or posts.',
      'Do not create or refine a voice unless the user explicitly brings strong writing material this early.',
      'Keep diagnosis tight: ask only the most useful next question.',
      'Do not add context unless it will materially change what the strategy needs to capture next.',
      'Do not create context just because it might become useful later.',
      'Do not fill context deeply here; only capture the minimum truth needed to move forward.',
      'Do not mutate unrelated snapshot fields beyond what is needed to establish the initial shape of the strategy.',
    ],
    primaryActions: [
      'Identify the user’s primary and secondary reasons for writing.',
      'Understand the user’s starting point: from scratch, from notes, from past posts, or from an already formed direction.',
      'Understand where the user writes or wants to write.',
      'Capture obvious early strategic signals such as goals, platforms, or a rough audience summary if they are already clear.',
      'Decide whether any additional situational context is needed before broader strategy work begins.',
      'Use context only when it materially affects the shape or truth of the strategy.',
      'Capture only the minimum useful context needed for the next stage.',
    ],
    expectedSnapshotEffects: [
      'goals are present if the user’s purpose is already clear',
      'platforms are present if the user already knows where they write',
      'audience may have a rough early summary if it is already clear',
      'relevant situational context may be added when it materially affects strategy',
      'unnecessary context is not added prematurely',
      'unresolved questions are captured only when they block truthful progress',
    ],
    operationalGuidance: `
Use Diagnose to understand the shape of the strategy, not to complete it.

Diagnose-stage priorities:
- Clarify why the user is writing before deciding what structure is needed.
- Prefer understanding the real use case over classifying it too early.
- Capture only the early context that will materially improve the next step.
- Standard context categories are preferred patterns, not mandatory structure.
- Use custom context only when a real strategic need does not fit the standard categories well.
- If the signal is mixed or weak, ask a clarifying question instead of adding context immediately.
- If no additional context is clearly needed yet, continue without forcing it.
if the user has not yet provided rich context, begin with a broad intake prompt
invite the user to share raw context, notes, docs, links, or rough thoughts
after a broad intake, synthesize what matters and ask the single most useful next question

What "good enough" means here:
- The user’s purpose is clear enough to guide the next stage.
- The dominant purpose of the strategy is clear, along with any important secondary motives.- Any added context is clearly justified and minimal.
- The strategy can move forward without pretending to know more than it actually does.

Do not treat this stage like a form.
Do not talk like you are building internal structure.
Do not over-commit too early.
`,
  },

  [StrategyStage.Context]: {
    name: StrategyStage.Context,
    description:
      'Capture any additional situational context that materially affects the strategy before building the broader strategic core.',
    goal: 'Add or refine only the context that meaningfully changes how the strategy should be understood, without turning the conversation into a rigid context-filling exercise.',
    escalationTrigger:
      'All strategically important situational context is either clear enough to support the next stage, intentionally left out, or explicitly marked as unresolved where it still matters.',
    guardrails: [
      'Do not turn this stage into a form or checklist.',
      'Do not add context just because it might be useful later.',
      'Do not fill context exhaustively; aim for usable truth, not completeness.',
      'Do not drift into broad audience, problem, or goal definition unless it is strictly needed to clarify important context.',
      'Do not create themes or voice here.',
      'Do not over-infer business, identity, or growth context from weak signals.',
      'Do not force standard context categories when the situation is better captured with a small amount of custom context.',
    ],
    primaryActions: [
      'Review whether any additional situational context is needed before broader strategy work continues.',
      'Ask targeted follow-up questions only where missing context would materially weaken the strategy.',
      'Add or refine standard context when it clearly fits the case.',
      'Use custom context when the important situational truth does not fit the standard patterns well.',
      'Keep context minimal and decision-shaping rather than exhaustive.',
      'Record unresolved questions only when missing context still matters for downstream strategy quality.',
    ],
    expectedSnapshotEffects: [
      'the snapshot contains only the situational context that materially affects strategy',
      'context remains minimal, truthful, and useful rather than exhaustive',
      'standard context is used when it clearly fits',
      'custom context may be used when standard context would distort the case',
      'unresolved questions remain only where missing context still matters',
      'the strategy is ready to move into broader direction-building',
    ],
    operationalGuidance: `
Use this stage to capture strategically important situational truth, not to fill predefined sections.

Context-stage priorities:
- Add context only when it materially changes how the strategy should be built.
- Prefer the smallest amount of context structure that preserves what matters.
- If standard context fits clearly, use it.
- If the important context does not fit the standard patterns well, use custom context instead of forcing a bad fit.
- If no additional context is needed, move on rather than manufacturing it.
- If the user is unsure, help them think with focused options or contrast instead of demanding a perfect answer.
- If important situational context is still sparse, first ask for a broad context dump before asking narrow follow-ups
- Let the user share product / company / personal / market context in raw form
- Only then narrow into materially important context

What "good enough" means here:
- The strategy now includes the key situational truth that would otherwise distort later decisions.
- Context is specific enough to matter, but not bloated.
- The user would recognize the captured context as real and relevant.
- The next stage can build broader direction without relying on weak assumptions.

Do not treat this stage like schema completion.
Do not make the user feel that you are filling internal boxes.
Do not use context as a substitute for the strategic core.
`,
  },

  [StrategyStage.Direction]: {
    name: StrategyStage.Direction,
    description:
      'Build the strategic core of the snapshot. This stage clarifies who the content is for, what real problems or tensions it should orbit around, and what the content is trying to achieve.',
    goal: 'Produce a usable strategic core that explains the real audience, the most important problems or tensions, and the main strategic goals of the content.',
    escalationTrigger:
      'The snapshot contains a clear enough audience summary, a small set of meaningful problems or tensions, and a small set of meaningful goals strong enough to support theme-building in the next stage.',
    guardrails: [
      'Do not create themes yet.',
      'Do not create or refine voice here.',
      'Do not generate ideas or posts.',
      'Do not settle for vague, generic, or purely aspirational wording.',
      'Do not create too many weak or overlapping problems or goals.',
      'Do not let context dominate the strategy if it is only secondary.',
      'Do not over-polish wording; aim for usable clarity, not final copy.',
    ],
    primaryActions: [
      'Write or refine the audience summary so it reflects the real target reader, not a vague placeholder.',
      'Identify the main recurring problems or tensions that the content should repeatedly engage with.',
      'Identify the main strategic goals the content is meant to support.',
      'Use any relevant context only to sharpen the strategic core, not to replace it.',
      'Remove or avoid weak, repetitive, or generic problem and goal statements.',
      'Capture unresolved questions only if they still block a truthful audience, problem, or goal definition.',
    ],
    expectedSnapshotEffects: [
      'audience is defined as a usable strategic summary',
      'problems contain a small set of meaningful tensions or recurring frictions',
      'goals contain a small set of meaningful strategic outcomes',
      'relevant context is reflected in the strategic core where it truly matters',
      'generic or redundant direction statements are removed or avoided',
      'the snapshot is ready for theme construction',
    ],
    operationalGuidance: `
Use this stage to define the strategic core, not the whole content system.

Direction-stage priorities:
- Make the audience summary concrete enough to guide future writing decisions.
- Focus on the problems and tensions that actually deserve repeated attention in content.
- Treat goals as strategic outcomes, not vanity labels.
- Prefer a small number of strong problems and goals over a long list of weak ones.
- Use context to sharpen direction only when it materially changes the truth of the strategy.
- If context is present but secondary, keep the strategic core centered on the broader direction.
- If the strategic core is still thin, briefly widen before narrowing.
- Prefer one sharp synthesis after rich context over many small extraction questions.

What "good enough" means here:
- The audience is clear enough that the user would recognize it as the real reader.
- The problems are specific enough to support strong themes later.
- The goals are clear enough to bias future ideation and writing decisions.
- The strategic core reflects the user’s actual intent rather than generic creator language.

Do not use this stage to create themes.
Do not use this stage to define tone or voice.
Do not use this stage to jump into ideation.
`,
  },

  [StrategyStage.Themes]: {
    name: StrategyStage.Themes,
    description:
      'Turn the strategic core into a coherent set of long-running conversation lines. This stage defines the themes the user should repeatedly speak through over time.',
    goal: 'Create, refine, or link a small set of active themes that express the audience, tensions, and goals of the strategy in a repeatable way.',
    escalationTrigger:
      'The strategy has a coherent, non-redundant set of active themes that clearly reflect the strategic core and are strong enough to support later angle and idea generation.',
    guardrails: [
      'Do not generate ideas or posts here.',
      'Do not use themes as one-off post topics.',
      'Do not create themes that are too broad, too generic, or too similar to each other.',
      'Do not create more themes when narrowing, merging, or reusing would be better.',
      'Do not invent themes that are not grounded in the current strategic core.',
      'Do not move into tone, voice, or post execution.',
    ],
    primaryActions: [
      'Review the audience, problems, and goals already present in the strategic core.',
      'Identify the long-running conversation lines that naturally emerge from that core.',
      'Link existing themes when they already fit the strategy well.',
      'Create a new theme only when the strategy needs a genuinely distinct lane.',
      'Update themes when the idea is right but the wording or scope is wrong.',
      'Keep the set of active themes small, distinct, and strategically central.',
    ],
    expectedSnapshotEffects: [
      'the strategy contains a coherent set of active themes',
      'themes clearly reflect the strategic core rather than drifting away from it',
      'redundant, weak, or overlapping themes are avoided or removed',
      'existing themes are reused where appropriate instead of duplicated',
      'the active theme set is strong enough to support downstream ideation',
      'the strategy is ready to move into voice and expression work',
    ],
    operationalGuidance: `
Use this stage to define repeatable conversation lanes, not individual content pieces.

Theme-stage priorities:
- Derive themes from the strategic core, especially the strongest tensions and goals.
- Prefer a small number of strong themes over a larger set of weak ones.
- Reuse existing themes when they already express the right line of conversation.
- Create a new theme only when the strategy needs a genuinely distinct lane.
- Update a theme if the idea is right but the wording or scope is wrong.
- Treat themes as durable lines of thinking, not labels for isolated topics.

What "good enough" means here:
- Each theme is distinct enough to support its own family of future angles.
- The set of themes feels coherent rather than scattered.
- The user would recognize these as the main lines they want to speak through.
- The themes are narrow enough to be useful, but broad enough to support repeated content over time.

Do not use this stage to define one-off post topics.
Do not use this stage to start ideation.
Do not use this stage to solve voice or expression questions.
`,
  },

  [StrategyStage.Voice]: {
    name: StrategyStage.Voice,
    description:
      'Define how this strategy should sound. This stage links, creates, or refines a usable voice foundation and captures only the expression guidance that materially improves downstream writing.',
    goal: 'Establish a usable voice foundation for the strategy by linking an existing voice or creating/refining one, then capture the key adjustments that make future writing feel natural and aligned.',
    escalationTrigger:
      'The strategy has a usable expression foundation: an appropriate voice is linked or consciously left minimal, and any important strategy-specific voice adjustments have been captured.',
    guardrails: [
      'Do not generate ideas or posts here.',
      'Do not overfit the voice to one specific future post.',
      'Do not confuse stable voice identity with temporary strategy context.',
      'Do not create generic voice rules that could apply to almost anyone.',
      'Do not force voice creation if the user does not have enough material yet; a minimal but truthful voice state is better than a fake one.',
      'Do not drift back into broad strategy, audience, or theme work unless it is strictly needed to clarify expression.',
    ],
    primaryActions: [
      'Check whether an existing voice already fits this strategy well enough.',
      'Query existing voices before creating a new one when appropriate.',
      'Create a new voice only when no existing voice is a meaningful fit or the user clearly needs a distinct one.',
      'Refine voice only when the user provides enough signal through examples, preferences, or corrections.',
      'Capture only the strategy-level voice adjustments that will materially shape downstream writing.',
      'Keep expression guidance minimal if stronger voice definition is not yet necessary.',
    ],
    expectedSnapshotEffects: [
      'a usable voice is linked to the strategy, or the lack of a strong voice is consciously acknowledged',
      'voice adjustments reflect this strategy’s context rather than replacing the base voice',
      'stable voice traits are kept in the voice profile, not scattered across the strategy',
      'generic, weak, or contradictory expression instructions are avoided',
      'the strategy is ready to move into sharpening with a clear enough expression foundation',
    ],
    operationalGuidance: `
Use this stage to establish expression discipline, not to imitate a person perfectly.

Voice-stage priorities:
- Prefer linking an existing voice when it already matches the strategy well enough.
- Create a new voice only when the difference is real and meaningful.
- If the user provides writing examples, extract stable style signals from them.
- Put stable voice identity into the voice profile.
- Put only contextual expression shifts into strategy voice adjustments.
- If voice is still unclear but not blocking progress, keep it minimal rather than over-designing it.
- If voice is unclear, first ask for examples, old posts, references, or rough style signals
- Do not start with abstract tone questions if concrete examples would work better

What "good enough" means here:
- There is a base voice that would make downstream drafts sound directionally right.
- Important strategy-specific adjustments are captured.
- The expression guidance is specific enough to avoid generic output.
- The voice is not so narrow that it only fits one post.

Use examples to extract:
- tone of voice
- density and rhythm
- structural habits
- preferred proof style
- recurring avoid patterns

Do not use this stage to write sample posts unless that is the only realistic way to clarify a true voice distinction.
Do not use this stage to solve themes, angles, or ideation.
`,
  },

  [StrategyStage.Sharpen]: {
    name: StrategyStage.Sharpen,
    description:
      'Stress-test and refine the strategy snapshot so it becomes coherent, specific, and usable for downstream angle or idea generation.',
    goal: 'Remove vagueness, duplication, weak framing, and internal contradictions so the strategy has a clear center of gravity and can support strong downstream ideation.',
    escalationTrigger:
      'The snapshot is coherent, sufficiently specific, and truthfully complete enough that angle or idea generation would likely produce focused, non-generic outputs.',
    guardrails: [
      'Do not turn this stage into a new broad discovery phase.',
      'Do not generate ideas or posts here.',
      'Do not rewrite everything just to make it sound prettier.',
      'Do not keep refining forever in pursuit of perfection.',
      'Do not introduce brand-new major context unless the existing strategy is clearly missing something important.',
      'Do not remove important nuance just to make the snapshot look cleaner.',
      'Do not expand the strategy when narrowing or clarifying would be better.',
    ],
    primaryActions: [
      'Review the full strategy snapshot as one system rather than as isolated fields.',
      'Identify vague, generic, repetitive, or weakly differentiated elements.',
      'Check for contradictions between audience, goals, problems, themes, voice, platforms, and context.',
      'Reduce overlap by removing, merging, or narrowing weak elements.',
      'Sharpen wording where the current phrasing is too broad to guide future ideation.',
      'Keep unresolved questions only where they still materially affect downstream quality.',
      'Decide whether the strategy is strong enough to move forward or still needs targeted refinement.',
    ],
    expectedSnapshotEffects: [
      'the snapshot has a clear strategic center of gravity',
      'weak, generic, or duplicate elements are removed or sharpened',
      'themes, goals, voice, context, and platforms no longer conflict with each other',
      'only meaningful unresolved questions remain',
      'the strategy is materially stronger and ready for downstream ideation work',
    ],
    operationalGuidance: `
Use this stage to improve strategic quality, not to expand scope.

Sharpen-stage priorities:
- Prefer a smaller number of strong elements over a larger number of weak ones.
- Remove overlap when two elements do almost the same job.
- Narrow overly broad language until it becomes operationally useful.
- Preserve nuance when it is strategically important.
- Use unresolved questions honestly instead of pretending clarity where none exists.
- Treat coherence as more important than completeness.

What to look for:
- audience language that could apply to almost anyone
- problems that sound like generic niche pain points rather than real tensions
- goals that are too broad, too many, or mutually conflicting
- themes that overlap or feel like labels instead of real conversation lanes
- voice guidance that is generic, contradictory, or disconnected from the strategy
- context that exists but does not actually shape the strategy
- platform notes that are too tactical or too vague to matter

What "good enough" means here:
- the user could read the snapshot and recognize it as true
- the strategy feels focused rather than scattered
- downstream ideation would have enough clarity to produce distinct outputs
- no major part of the snapshot is fake-clear or misleadingly polished

Do not use this stage to start ideation.
Do not use this stage to keep polishing when the strategy is already good enough to move forward.
`,
  },

  [StrategyStage.FreeRefine]: {
    name: StrategyStage.FreeRefine,
    description:
      'Refine an existing strategy through natural conversation. This stage allows the user to revisit, correct, expand, narrow, or reframe any part of the strategy over time.',
    goal: 'Keep the strategy alive and truthful by applying local or broader updates through conversation while preserving coherence across the snapshot.',
    escalationTrigger:
      'None. This stage remains available as an ongoing refinement mode after the strategy has been initially built.',
    guardrails: [
      'Do not assume the user wants a full rebuild when they mention a local change.',
      'Do not silently overwrite unrelated parts of the strategy.',
      'Do not remove important existing structure without clear conversational evidence.',
      'Do not broaden the strategy when narrowing or clarifying would be better.',
      'Do not drift into post execution or ideation unless the user explicitly wants to leave strategy work.',
      'Do not turn every refinement into a large structural rewrite.',
    ],
    primaryActions: [
      'Determine whether the user wants a local refinement, a cross-cutting refinement, or a structural shift.',
      'Apply the smallest truthful update that satisfies the user’s intent.',
      'Ask clarifying questions when a requested change would materially affect multiple connected parts of the strategy.',
      'Update only the relevant parts directly when the user’s intent is already clear.',
      'Allow deeper restructuring when the user clearly signals that the strategy itself has changed.',
      'Preserve unresolved questions only when they still matter after the refinement.',
    ],
    expectedSnapshotEffects: [
      'the snapshot reflects the user’s latest understanding without losing still-valid structure',
      'local refinements stay local unless broader changes are truly required',
      'broader strategic shifts are applied coherently across affected parts of the snapshot',
      'the strategy remains usable for downstream ideation after refinement',
      'the snapshot stays truthful rather than artificially stable',
    ],
    operationalGuidance: `
Use this stage as an ongoing strategy maintenance mode, not as a fresh onboarding flow.

FreeRefine priorities:
- First determine the scope of the requested change: local, cross-cutting, or structural.
- Prefer the smallest truthful update over an unnecessary full rewrite.
- If one change logically affects other parts of the snapshot, clarify before propagating it.
- Preserve working parts of the strategy whenever they still remain true.
- Allow the strategy to evolve when the user has genuinely learned something new.

How to think about refinement:
- Local refinement: one field, one area, or one small part changes while the rest still holds.
- Cross-cutting refinement: one new insight affects multiple connected parts and should be propagated carefully.
- Structural refinement: the user’s goals, context, direction, or overall shape have materially changed and the strategy should be restructured.

What "good enough" means here:
- the requested refinement is accurately reflected in the snapshot
- related parts remain coherent
- the strategy still feels like one system rather than a pile of edits
- no unnecessary rewrite was performed

Do not treat every new user message as evidence that the whole strategy is wrong.
Do not preserve outdated structure just to avoid making changes.
`,
  },
};
