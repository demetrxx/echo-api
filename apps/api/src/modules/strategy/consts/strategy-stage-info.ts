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
  whenToAdd: string;
  strongSignals: string[];
  whenNotToAdd: string[];
  nearbyBlocks: StrategyContextBlockType[];
}

export const CONTEXT_BLOCK_FILL_RULES: Record<
  StrategyContextBlockType,
  string
> = {
  [StrategyContextBlockType.Product]: `
Fill this block only until the commercial context is usable for later strategy work.

Good enough means:
- the offer or product is clear enough to name without vagueness,
- the transformation or result is understandable,
- the desired action is clear,
- the main objections or hesitations are visible,
- the proof this audience needs is visible at a high level.

Do not overbuild a sales framework.
Do not invent objections or proof needs if the user has not implied them.
`,

  [StrategyContextBlockType.Expertise]: `
Fill this block only until the authority context is usable for later strategy work.

Good enough means:
- it is clear what the user wants to be known for,
- it is clear where proof or examples matter,
- it is clear which myths, misconceptions, or weak assumptions are worth challenging.

Do not turn this into a full positioning framework.
Do not add proof areas that are not grounded in the user's actual expertise.
`,

  [StrategyContextBlockType.Growth]: `
Fill this block only until the growth context is usable for later strategy work.

Good enough means:
- the main attention or growth objective is clear,
- acceptable novelty or framing style is clear enough,
- there is at least a rough sense of how to avoid stale repetition.

Do not optimize for platform tactics too early.
Do not force viral mechanics if the user does not actually care about them.
`,

  [StrategyContextBlockType.Identity]: `
Fill this block only until the identity context is usable for later strategy work.

Good enough means:
- the desired associations are clear,
- the repeated worldview threads are becoming visible,
- the main non-negotiables are explicit enough to protect the user's identity later.

Do not make this overly abstract or philosophical.
Do not fabricate identity language that feels more polished than true.
`,

  [StrategyContextBlockType.Community]: `
Fill this block only until the community context is usable for later strategy work.

Good enough means:
- the kind of interaction the user wants is clear,
- the preferred conversation style is visible,
- any important audience language cues are captured if they materially affect tone or participation.

Do not confuse community with generic engagement.
Do not optimize for replies if the user actually wants trust or clarity more than interaction.
`,

  [StrategyContextBlockType.Clarity]: `
Fill this block only until the thinking and exploration context is usable for later strategy work.

Good enough means:
- recurring questions are visible,
- unresolved tensions are visible,
- the main lines of inquiry are clear enough to support exploratory content later.

Do not force tidy conclusions.
Do not collapse half-formed thinking into fake certainty.
`,

  [StrategyContextBlockType.Journey]: `
Fill this block only until the journey context is usable for later strategy work.

Good enough means:
- it is clear what ongoing process, project, or journey is being documented,
- the main progress arcs are visible,
- the main update types are clear enough to support future posts.

Do not turn this into a timeline or project plan.
Do not add progress arcs unless the process is genuinely time-based.
`,

  [StrategyContextBlockType.Destination]: `
Fill this block only until the destination context is usable for later strategy work.

Good enough means:
- the main destination channels or endpoints are clear,
- the intended bridge actions are clear,
- any important nuance about the handoff is captured.

Do not design a funnel here.
Do not add destinations unless the user actually wants content to move people somewhere specific.
`,

  [StrategyContextBlockType.Opportunity]: `
Fill this block only until the opportunity context is usable for later strategy work.

Good enough means:
- the desired opportunities are clear,
- the main credibility signals are visible,
- the role or professional narrative the user wants to reinforce is understandable.

Do not turn this into a resume or positioning exercise.
Do not invent opportunity goals the user has not expressed.
`,
};

export const CONTEXT_BLOCK_SELECTION_RULES: ContextBlockSelectionRule[] = [
  {
    block: StrategyContextBlockType.Product,
    whenToAdd:
      'Add when the user clearly writes to drive leads, sales, conversions, or movement toward an offer.',
    strongSignals: [
      'I want clients',
      'I want sales',
      'I want content to lead people to my product or service',
      'I need to address objections before people buy',
      'I sell a service, product, course, or offer',
    ],
    whenNotToAdd: [
      'The user only wants general audience growth',
      'The user is mostly exploring ideas or clarifying thinking',
      'Trust-building is present, but there is no real offer or action path yet',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Expertise,
      StrategyContextBlockType.Destination,
    ],
  },

  {
    block: StrategyContextBlockType.Expertise,
    whenToAdd:
      'Add when the user wants to build authority, trust, or recognition as someone who deeply understands a topic.',
    strongSignals: [
      'I want people to see me as an expert',
      'I want to build trust',
      'I want to be known for a topic',
      'I want to explain complex things clearly',
      'I want to show that I know what I am talking about',
    ],
    whenNotToAdd: [
      'The user is primarily focused on self-expression without authority goals',
      'The user is purely sales-driven and expertise is not part of the value path',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Identity,
      StrategyContextBlockType.Product,
      StrategyContextBlockType.Opportunity,
    ],
  },

  {
    block: StrategyContextBlockType.Growth,
    whenToAdd:
      'Add when attention, reach, discoverability, or audience growth is a primary objective.',
    strongSignals: [
      'I want more reach',
      'I want to grow my audience',
      'I care about performance and traction',
      'I want more shares, saves, or distribution',
      'I want content that gets picked up more often',
    ],
    whenNotToAdd: [
      'Growth is only a nice-to-have, not a real priority',
      'The user mainly wants clarity, trust, or expression',
      'The user is not concerned with content performance at all',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Community,
      StrategyContextBlockType.Destination,
      StrategyContextBlockType.Product,
    ],
  },

  {
    block: StrategyContextBlockType.Identity,
    whenToAdd:
      'Add when the user wants to shape how they are perceived, what they are associated with, and what should feel unmistakably theirs.',
    strongSignals: [
      'I want to build a personal brand',
      'I want people to associate me with certain ideas',
      'I care a lot about how I sound and what I stand for',
      'I do not want to lose myself in content',
      'I want my voice or worldview to be recognizable',
    ],
    whenNotToAdd: [
      'The user only cares about utility, performance, or sales outcomes',
      'Identity is not part of the stated purpose of writing',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Expertise,
      StrategyContextBlockType.Clarity,
      StrategyContextBlockType.Opportunity,
    ],
  },

  {
    block: StrategyContextBlockType.Community,
    whenToAdd:
      'Add when the user wants content to create dialogue, interaction, belonging, or repeated audience participation.',
    strongSignals: [
      'I want conversations, not just broadcasting',
      'I want a closer relationship with my audience',
      'I want people to reply and engage',
      'I want to build a community',
      'I care about interaction quality, not just reach',
    ],
    whenNotToAdd: [
      'The user is mainly focused on one-way authority or publishing',
      'The user only cares about growth metrics, not community dynamics',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Growth,
      StrategyContextBlockType.Identity,
      StrategyContextBlockType.Destination,
    ],
  },

  {
    block: StrategyContextBlockType.Clarity,
    whenToAdd:
      'Add when the user writes to think, clarify, explore, or better understand their own ideas.',
    strongSignals: [
      'I write to clarify my thinking',
      'Writing helps me understand what I believe',
      'I want to explore ideas over time',
      'I keep circling certain questions',
      'I want to structure my thoughts',
    ],
    whenNotToAdd: [
      'The user is purely focused on sales or performance outcomes',
      'Thinking clarity is not part of the user’s stated motivation',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Identity,
      StrategyContextBlockType.Journey,
      StrategyContextBlockType.Expertise,
    ],
  },

  {
    block: StrategyContextBlockType.Journey,
    whenToAdd:
      'Add when the user is documenting a process, sharing progress, or building in public over time.',
    strongSignals: [
      'I want to document my journey',
      'I am building in public',
      'I want to share progress over time',
      'I want to post updates, lessons, and tradeoffs',
      'My content follows an ongoing process or project',
    ],
    whenNotToAdd: [
      'There is no real time-based process being documented',
      'The user is not sharing progress, only conclusions or advice',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Clarity,
      StrategyContextBlockType.Identity,
      StrategyContextBlockType.Expertise,
    ],
  },

  {
    block: StrategyContextBlockType.Destination,
    whenToAdd:
      'Add when the user wants content to move people into an owned channel or a next-step destination.',
    strongSignals: [
      'I want people to join my newsletter',
      'I want people to move to Telegram',
      'I want content to drive people to a waitlist or site',
      'I want an owned audience, not just platform followers',
      'I want posts to bridge into another channel',
    ],
    whenNotToAdd: [
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
    whenToAdd:
      'Add when the user writes to attract career, reputation, speaking, consulting, hiring, or partnership opportunities.',
    strongSignals: [
      'I want to attract opportunities',
      'I want people to invite me to speak or consult',
      'I want career upside from my content',
      'I want to be discoverable for partnerships or roles',
      'I want my content to reinforce my professional narrative',
    ],
    whenNotToAdd: [
      'The user is only focused on self-expression or thinking clarity',
      'The desired outcome is clearly sales/product conversion instead',
    ],
    nearbyBlocks: [
      StrategyContextBlockType.Expertise,
      StrategyContextBlockType.Identity,
      StrategyContextBlockType.Product,
    ],
  },
];

export const STRATEGY_STAGES: (i: {
  snapshot: StrategySnapshot;
}) => Record<StrategyStage, StrategyStageInfo> = (i) => ({
  [StrategyStage.Diagnose]: {
    name: StrategyStage.Diagnose,
    description:
      'Identify why the user wants to blog, what kind of content context they need, and which strategy scaffold should be created before deeper strategy work begins.',
    goal: 'Understand the user’s intent, starting point, channels, and available source material well enough to infer the relevant strategy context blocks and set up the initial snapshot structure.',
    escalationTrigger:
      'The user’s primary purpose is clear enough to infer the initial strategy scaffold, including the necessary context blocks, relevant goals, and any obvious early context such as platforms or audience.',

    guardrails: [
      'Do not try to fully define the strategy yet.',
      'Do not generate themes, ideas, or posts.',
      'Do not create or refine a voice unless the user explicitly brings strong writing examples this early.',
      'Keep the diagnostic phase tight: ask only the most useful next question.',
      'Do not fill branch-specific blocks deeply; only determine whether they are needed.',
      'Do not mutate unrelated snapshot fields beyond what is needed to set up the scaffold.',
    ],

    expectedSnapshotEffects: [
      'selected goals are present and reasonably prioritized',
      'necessary context blocks are present in the snapshot',
      'clearly irrelevant context blocks are absent or removed',
      'platforms are added if the user already knows them',
      'audience may have a rough early summary if it is already clear',
      'unresolved questions are captured only when they block correct branching',
    ],

    primaryActions: [
      'Identify the user’s primary and secondary blogging goals.',
      'Understand the user’s starting point: from scratch, from notes, from past posts, or from an already formed direction.',
      'Understand where the user writes or wants to write.',
      'Infer which strategy context blocks are necessary for this case.',
      'Add missing context blocks and remove clearly irrelevant ones if needed.',
      'Capture only the minimum useful context needed for the next stage.',
    ],

    operationalGuidance: `
Use Diagnose to determine the shape of the strategy, not to fully fill it.

Use these rules as a decision rubric, not as a checklist.

Add a context block only when:
- the user's purpose clearly supports it, and
- the block will materially change what strategy information must be captured next.

Prefer at most one primary block and one secondary block during Diagnose.
If the signal is weak or mixed, ask a clarifying question instead of adding the block.
Nearby blocks are alternatives or secondary candidates, not automatic additions.

Selection rules:
${CONTEXT_BLOCK_SELECTION_RULES.map(
  (r) => `
- ${r.block}
  - When to add: ${r.whenToAdd}
  - Strong signals: ${r.strongSignals.join('; ')}
  - When not to add: ${r.whenNotToAdd.join('; ')}
`,
).join('\n')}
`,
  },

  [StrategyStage.Context]: {
    name: StrategyStage.Context,
    description:
      'Fill the branch-specific context blocks that were enabled during diagnosis. This stage captures only the situational context that is necessary for this case before building the broader strategic core.',
    goal: 'Populate the enabled context blocks with enough real, decision-shaping information so that the later strategy core is built on accurate situational context rather than generic assumptions.',
    escalationTrigger:
      'All enabled context blocks are either sufficiently filled to support the next stage, intentionally skipped, or clearly marked as unresolved where missing context still matters.',
    guardrails: [
      'Do not re-open broad diagnosis unless the original scaffold is clearly wrong.',
      'Do not drift into general audience, problem, or goal definition unless it is strictly needed to complete a context block.',
      'Do not create themes or voice here.',
      'Do not fill optional fields just because they exist; only capture what materially matters.',
      'Do not over-infer missing business or personal context from weak signals.',
      'Do not try to make the context blocks exhaustive; aim for usable clarity, not completeness.',
    ],
    primaryActions: [
      'Review which context blocks were enabled during Diagnose.',
      'Ask targeted follow-up questions only for the enabled blocks.',
      'Fill each enabled block with the minimum context needed for downstream strategy work.',
      'Mark missing but important context as unresolved instead of forcing weak assumptions.',
      'Correct the block scaffold only if Diagnose clearly enabled the wrong block or missed a necessary one.',
      'Capture supporting notes only when they help preserve nuance that should not yet be normalized into the core strategy.',
    ],
    expectedSnapshotEffects: [
      'enabled context blocks contain meaningful branch-specific context',
      'irrelevant or mistakenly enabled blocks may be removed if clearly unnecessary',
      'notes may capture important nuance that does not belong in the core strategy yet',
      'unresolved questions exist only where missing context still blocks good downstream strategy work',
      'the snapshot is ready to move from situational context into broader direction-building',
    ],
    operationalGuidance: `
Use this stage to fill branch-specific context, not the whole strategy.

Context-stage priorities:
- Work only on enabled context blocks unless Diagnose was clearly wrong.
- Prefer the smallest set of questions that unlocks a usable block.
- Capture only the context that will materially change later strategic decisions.
- If a block is relevant but the user does not yet know the answer, record an unresolved question instead of forcing a guess.
- If a block turns out to be unnecessary, remove it rather than filling it with weak content.

<context_filling_rules>
What "good enough" means here:

${i.snapshot.contextBlocks.map((b) => CONTEXT_BLOCK_FILL_RULES[b]).join('\n\n')}
</context_filling_rules>

Do not treat this stage as a place to polish wording.
Do not turn this stage into a second Diagnose.
Do not move into themes, voice, or ideation from here.
`,
  },

  [StrategyStage.Direction]: {
    name: StrategyStage.Direction,

    description:
      'Build the strategic core of the snapshot. This stage turns the diagnosed intent and any branch-specific context into a clear audience summary, a prioritized set of core problems or tensions, and a prioritized set of content goals.',

    goal: 'Produce a usable strategic core that explains who the content is for, what real problems or tensions it should orbit around, and what the content is trying to achieve.',

    escalationTrigger:
      'The snapshot contains a clear enough audience summary, multiple meaningful problems or tensions, and multiple meaningful goals with wording strong enough to support theme-building in the next stage.',

    guardrails: [
      'Do not create themes yet.',
      'Do not create or refine voice here.',
      'Do not generate ideas or posts.',
      'Do not settle for vague, generic, or purely aspirational wording.',
      'Do not create too many weak or overlapping problems or goals.',
      'Do not ignore already captured context blocks if they materially shape the core direction.',
      'Do not over-polish wording; aim for usable clarity, not final copy.',
    ],

    primaryActions: [
      'Write or refine the audience summary so it reflects the real target reader, not a vague demographic placeholder.',
      'Identify the main recurring problems or tensions that the content should address.',
      'Identify the main content goals and order them by practical importance.',
      'Use branch-specific context blocks to sharpen the direction when relevant.',
      'Remove or avoid weak, repetitive, or generic problem and goal statements.',
      'Capture unresolved questions only if they still block a truthful audience, problem, or goal definition.',
    ],

    expectedSnapshotEffects: [
      'audience is defined as a usable strategic summary',
      'problems contain a small set of meaningful, prioritized tensions',
      'goals contain a small set of meaningful, prioritized outcomes',
      'branch-specific context is reflected in the strategic core where relevant',
      'generic or redundant direction statements are removed or avoided',
      'the snapshot is ready for theme construction',
    ],

    operationalGuidance: `
Use this stage to define the strategic core, not the full content system.

Direction-stage priorities:
- Make the audience summary concrete enough to guide future writing decisions.
- Focus on the tensions and problems that actually deserve repeated attention in content.
- Treat goals as strategic outcomes, not vanity labels.
- Prefer a small number of strong problems and goals over a long list of weak ones.
- Use context blocks to sharpen direction, not to replace it.

What "good enough" means here:
- Audience is clear enough that the user would recognize it as the real reader.
- Problems are specific enough to generate strong themes later.
- Goals are clear enough to bias future ideation and writing decisions.
- The strategic core reflects the user’s actual intent, not generic creator language.

Do not use this stage to create themes.
Do not use this stage to define tone or voice.
Do not use this stage to jump into ideation.
`,
  },

  [StrategyStage.Themes]: {
    name: StrategyStage.Themes,

    description:
      'Turn the strategic core into a coherent set of long-running conversation lines. This stage defines the themes the user should repeatedly speak through over time.',

    goal: 'Create, refine, or link a small set of active themes that express the user’s audience, problems, and goals in a repeatable way.',

    escalationTrigger:
      'The strategy has a coherent, non-redundant set of active themes that clearly map back to the strategic core and are strong enough to support later angle and idea generation.',

    guardrails: [
      'Do not generate ideas or posts here.',
      'Do not use themes as one-off post topics.',
      'Do not create themes that are too broad, too generic, or too similar to each other.',
      'Do not create more themes when prioritizing or merging would be better.',
      'Do not invent themes that are not grounded in the current direction.',
      'Do not move into tone, voice, or post execution.',
    ],

    primaryActions: [
      'Review the audience, problems, and goals already present in the strategic core.',
      'Identify the long-running conversation lines that naturally emerge from that core.',
      'Link existing themes when they already fit the strategy well.',
      'Create new themes only when no existing theme captures the needed line clearly enough.',
      'Update themes when a partially fitting theme needs sharper wording or a more accurate scope.',
      'Prioritize active themes so the strategy has a usable center of gravity.',
    ],

    expectedSnapshotEffects: [
      'the snapshot contains a coherent set of active themes',
      'themes are clearly connected to the strategic core',
      'redundant, weak, or overlapping themes are avoided or removed',
      'existing themes are reused where appropriate instead of duplicating them',
      'theme priorities are clear enough to guide future angle and idea generation',
      'the strategy is ready to move into voice and expression work',
    ],

    operationalGuidance: `
Use this stage to define repeatable content lanes, not individual content pieces.

Theme-stage priorities:
- Derive themes from the strategic core, especially the strongest problems and goals.
- Prefer a small number of strong themes over a larger set of weak ones.
- Reuse existing themes when they already express the right line of conversation.
- Create a new theme only when the current strategy needs a distinct lane that does not already exist.
- Update a theme if the concept is right but the wording or scope is off.
- Prioritize themes based on how central they are to this strategy, not based on novelty alone.

What "good enough" means here:
- Each theme is distinct enough to support its own family of future angles.
- The set of themes feels coherent rather than scattered.
- The user could recognize these themes as the main lines they want to speak through.
- The themes are narrow enough to be useful, but broad enough to support repeated content over time.

Do not use this stage to define one-off post topics.
Do not use this stage to start ideation.
Do not use this stage to solve voice or expression questions.
`,
  },

  [StrategyStage.Voice]: {
    name: StrategyStage.Voice,

    description:
      'Define how this strategy should sound. This stage selects, creates, or refines a usable voice profile and captures the strategy-specific expression adjustments needed for downstream writing.',

    goal: 'Establish a usable voice foundation for the strategy by linking an existing voice or creating/refining one, then capture the key adjustments that will make future writing sound natural and aligned.',

    escalationTrigger:
      'The strategy has a usable voice foundation: an appropriate voice is linked or consciously skipped, and any important strategy-specific voice adjustments have been captured.',

    guardrails: [
      'Do not generate ideas or posts here.',
      'Do not overfit the voice to one specific future post.',
      'Do not confuse stable voice identity with temporary strategy context.',
      'Do not create generic rules that would fit almost anyone.',
      'Do not force voice creation if the user does not have enough material yet; a consciously minimal or unresolved state is better than a fake voice.',
      'Do not drift into broad strategy definition, themes, or audience work unless it is strictly needed to clarify voice.',
    ],

    primaryActions: [
      'Check whether an existing voice already fits this strategy well enough.',
      'If needed, query existing voices before creating a new one.',
      'Create a new voice only when no existing voice is a good fit or when the user clearly needs a distinct one.',
      'Refine or update voice only when the user provides enough signal through examples, preferences, or corrections.',
      'Capture strategy-level voice adjustments that should shape writing in this context.',
      'Record unresolved questions only if missing voice clarity would materially hurt downstream writing.',
    ],

    expectedSnapshotEffects: [
      'a usable voice is linked to the strategy, or the lack of voice is consciously acknowledged',
      'voice adjustments reflect this strategy’s context rather than replacing the base voice',
      'stable voice rules are stored in the voice profile, not scattered across the strategy',
      'generic, weak, or contradictory voice instructions are avoided',
      'the strategy is ready to move into sharpening with a clear enough expression foundation',
    ],

    operationalGuidance: `
Use this stage to establish expression discipline, not to imitate a person perfectly.

Voice-stage priorities:
- Prefer linking an existing voice when it already matches the strategy well enough.
- Create a new voice only when the difference is real and meaningful.
- If the user provides writing examples, extract stable style signals from them.
- Put stable style identity into the voice profile.
- Put only contextual expression changes into strategy voice adjustments.
- If voice is still unclear but not blocking progress, keep it minimal rather than over-designing it.

What "good enough" means here:
- There is a base voice that would make downstream drafts sound directionally right.
- Important strategy-specific adjustments are captured.
- The voice is specific enough to avoid generic output.
- The voice is not so narrow that it only fits one post.

Use examples to extract:
- tone of voice
- density and rhythm
- structural habits
- preferred proof style
- recurring avoid patterns

Do not use this stage to write sample posts unless that is the only way to clarify a real voice distinction.
Do not use this stage to solve themes, angles, or ideation.
`,
  },

  [StrategyStage.Sharpen]: {
    name: StrategyStage.Sharpen,

    description:
      'Stress-test and refine the strategy snapshot so it becomes coherent, specific, and usable for downstream angle or idea generation.',

    goal: 'Remove vagueness, duplication, weak framing, and internal contradictions so the strategy has a clear center of gravity and can support strong ideation later.',

    escalationTrigger:
      'The snapshot is coherent, sufficiently specific, and complete enough that angle or idea generation would likely produce focused, non-generic outputs.',

    guardrails: [
      'Do not turn this stage into a new broad discovery phase.',
      'Do not generate ideas or posts here.',
      'Do not rewrite everything just to make it sound prettier.',
      'Do not keep refining forever in pursuit of perfection.',
      'Do not introduce brand-new major branches unless the existing strategy is clearly missing something critical.',
      'Do not remove important nuance just to make the snapshot look cleaner.',
    ],

    primaryActions: [
      'Review the full strategy snapshot as one system rather than as isolated blocks.',
      'Identify vague, generic, repetitive, or weakly differentiated fields.',
      'Check for contradictions between goals, themes, channels, voice, and context blocks.',
      'Reduce overlap by removing, merging, or narrowing weak items.',
      'Sharpen wording where the current phrasing is too broad to guide future ideation.',
      'Keep unresolved questions only where they still matter for downstream quality.',
      'Decide whether the strategy is strong enough to move into ideation or still needs targeted refinement.',
    ],

    expectedSnapshotEffects: [
      'the snapshot has a clear strategic center of gravity',
      'weak, generic, or duplicate items are removed or sharpened',
      'themes, goals, and voice no longer conflict with each other',
      'only meaningful unresolved questions remain',
      'the strategy is materially stronger and ready for downstream ideation work',
    ],

    operationalGuidance: `
Use this stage to improve strategic quality, not to expand scope.

Sharpen-stage priorities:
- Prefer a smaller number of strong elements over a larger number of weak ones.
- Remove overlap when two items do almost the same job.
- Narrow overly broad language until it becomes operationally useful.
- Preserve nuance when it is strategically important.
- Use unresolved questions honestly instead of pretending clarity where none exists.
- Treat coherence as more important than completeness.

What to look for:
- audience summary that could apply to almost anyone
- problems that sound like generic niche pain points rather than real tensions
- goals that are too broad, too many, or mutually conflicting
- themes that overlap or feel like labels instead of real conversation lanes
- voice instructions that are generic, contradictory, or disconnected from the strategy
- context blocks that exist but do not actually shape the strategy

What "good enough" means here:
- the user could read the snapshot and recognize it as true
- the strategy feels focused rather than scattered
- future angle generation would have enough clarity to produce distinct outputs
- no major block is fake-clear or misleadingly polished

Do not use this stage to start ideation.
Do not expand the strategy unless a genuinely missing structural piece is discovered.
`,
  },

  [StrategyStage.FreeRefine]: {
    name: StrategyStage.FreeRefine,

    description:
      'Refine an existing strategy through natural conversation. This stage allows the user to revisit, correct, expand, narrow, or reframe any part of the strategy snapshot over time.',

    goal: 'Keep the strategy alive and truthful by applying local or global updates through conversation while preserving coherence across the snapshot.',

    escalationTrigger:
      'None. This stage remains available as an ongoing refinement mode after the strategy has been initially built.',

    guardrails: [
      'Do not assume the user wants a full rebuild when they mention a local change.',
      'Do not silently overwrite unrelated parts of the strategy.',
      'Do not remove important existing structure without clear conversational evidence.',
      'Do not keep broadening the strategy when narrowing would be better.',
      'Do not drift into post execution or ideation unless the user explicitly wants to leave strategy work.',
      'Do not force every refinement into a large structural change.',
    ],

    primaryActions: [
      'Understand whether the user wants a local refinement, a broader reframing, or a structural update.',
      'Apply changes to the relevant snapshot fields while preserving the integrity of the rest of the strategy.',
      'Ask clarifying questions when a requested change would have downstream effects on multiple blocks.',
      'Make local updates directly when the user’s intent is clear.',
      'Allow major reorientation when the user clearly signals that the strategy itself has changed.',
      'Preserve unresolved questions only when they still matter after the refinement.',
    ],

    expectedSnapshotEffects: [
      'the snapshot reflects the user’s latest understanding without losing important prior structure',
      'local refinements stay local unless broader changes are truly required',
      'major strategic changes are applied coherently across affected blocks',
      'the strategy remains usable for downstream ideation after refinement',
      'the snapshot stays truthful rather than artificially stable',
    ],

    operationalGuidance: `
Use this stage as an ongoing strategy maintenance mode, not as a fresh onboarding flow.

FreeRefine priorities:
- First determine the scope of the requested change: local, cross-block, or structural.
- Prefer the smallest truthful update over an unnecessary full rewrite.
- If one change logically affects other parts of the snapshot, clarify before changing them.
- Preserve working parts of the strategy whenever they still remain true.
- Allow the strategy to evolve when the user has genuinely learned something new.

How to think about refinement:
- Local refinement: one field or one block changes, while the rest of the strategy still holds.
- Cross-block refinement: one insight affects multiple connected blocks and should be propagated carefully.
- Structural refinement: the user’s goals, branches, or overall direction have materially changed and the strategy should be restructured.

What "good enough" means here:
- the requested refinement is accurately reflected in the snapshot
- related blocks remain coherent
- the strategy still feels like one system rather than a pile of edits
- no unnecessary rewrite was performed

Do not treat every new user message as evidence that the whole strategy is wrong.
Do not preserve outdated structure just to avoid making changes.
`,
  },
});
