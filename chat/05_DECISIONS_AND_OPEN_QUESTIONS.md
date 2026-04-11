# 05_DECISIONS_AND_OPEN_QUESTIONS.md

## Purpose
This document separates:
- what is currently locked
- what is still a working hypothesis
- what is still open

Its purpose is to prevent future conversations from re-opening resolved decisions unless explicitly requested.

This is the main “continuity” document for future product discussions.

---

# 1. LOCKED DECISIONS

These decisions are considered locked unless explicitly reopened.

---

## 1.1 Product Direction

### Locked
Echo is **not** being built as a generic AI content factory.

### Meaning
The product should not center itself around:
- “30 days of content in one click”
- pure automation
- bulk social content generation as the core truth
- prompt-hack theater
- heavy SMM dashboard behavior

### Why this is locked
The current strongest direction is:
- strategy as clarity/context
- notes as grounding
- refine-loop writing as the core execution advantage

---

## 1.2 Refine-Loop Writing Is Core

### Locked
The product’s main writing value is **refinement**, not one-shot generation.

### Meaning
The product should help users:
- sharpen
- structure
- ground
- rewrite
- adapt
- articulate better

It should not primarily try to “write for them from nothing”.

---

## 1.3 Strategy Is a Core Module

### Locked
Strategy is not optional garnish.
It is a core layer of the product.

### Meaning
Strategy exists to create:
- clarity for the user
- context for the system
- better inputs for angles, ideas, and posts

It is not a calendar or posting plan.

---

## 1.4 Strategy Is Conversation + Snapshot

### Locked
The Strategy module is built around:
- a persistent strategy conversation
- a live structured strategy snapshot

### Meaning
The conversation is the process.
The snapshot is the source of truth.

---

## 1.5 Refinement Is Not a Separate Strategy Mode

### Locked
There is no separate “refine strategy” mode.

### Meaning
If the user later says:
- “I understand the audience better now”
- “let’s rethink the goals”
- “this is too broad”

the same strategy conversation continues, and the snapshot is updated.

---

## 1.6 Snapshot Is the Source of Truth

### Locked
The strategy snapshot, not the chat history, is the canonical strategy artifact.

### Meaning
The agent must update the snapshot through tools.
The system should not treat the chat as the final state.

---

## 1.7 Notes Have Compiled Text + Items

### Locked
A note has:
- one coherent compiled text body
- underlying note items

### Meaning
The user mostly experiences notes as readable whole objects.
But the system still preserves:
- text items
- voice items
- links
- files
- images

This is a core architectural decision.

---

## 1.8 Theme Linkage Is Soft and Stateful

### Locked
Theme linkage for notes is not a hard binary truth.

### Meaning
A note can have:
- suggested theme link
- confirmed theme link
- rejected / cleared link

Suggested and confirmed are not the same.

---

## 1.9 Voice Is a Separate Entity

### Locked
Voice remains a separate stable entity.

### Meaning
Voice is not merged into Strategy.

Voice holds the stable author profile:
- style rules
- tone summary
- avoid rules
- examples

Strategy can reference and refine how voice is used in a given context.

---

## 1.10 Voice Creation / Refinement Happens Inside Strategy Flow

### Locked
Voice may be created or refined during the Strategy flow, before angles / ideas.

### Meaning
The Strategy process can include a Voice stage.
This is not a contradiction with Voice being a separate entity.

---

## 1.11 Strategy and Voice Are Not the Same

### Locked
Voice = stable author profile  
Strategy = current content direction context

### Meaning
Voice should stay small and stable.
Most contextual writing preferences belong in Strategy.

---

## 1.12 Angles and Ideas Are Not the Same

### Locked
Angle and Idea are distinct layers.

### Meaning
- Angle = framing / take / lens
- Idea = executable content unit closer to a post

This distinction is intentional.

---

## 1.13 Post Is Separate from Idea

### Locked
A post is a concrete writing object.
It is not the same as a theme, angle, or idea.

### Meaning
Post belongs to the write-post layer and uses:
- notes
- strategy context
- voice
- angle / idea
- refine loop

---

## 1.14 Strategy and Ideation Are Separate

### Locked
Strategy ends before full ideation / writing.

### Meaning
The default downstream flow is:

**strategy → angles / ideas → writing**

Strategy should not immediately collapse into final post generation by default.

---

## 1.15 Diagnose Must Come First

### Locked
The first step of strategy building is not a mode selector or a rigid multiselect.

### Meaning
The first step is a chat-based diagnosis phase.

Diagnose determines:
- goals
- branch hints
- relevant snapshot blocks
- what the strategy shape should contain

---

## 1.16 Dynamic Strategy Shape

### Locked
The Strategy snapshot is not one fixed schema for everyone.

### Meaning
Some blocks are always present.
Some are conditional and appear depending on the user’s goals and context.

Examples:
- product context for sales-like goals
- clarity context for thinking/exploration goals
- expertise context for trust/authority goals

---

## 1.17 Strategy Stages Were Simplified

### Locked
The stage model moved away from:
- Rapport
- Inventory
- Distillation
- Structuring
- TensionCheck
- Readiness
- Handoff
- FreeRefine

Toward a cleaner version centered around:
- Diagnose
- Direction
- Themes
- Voice
- Sharpen
- FreeRefine

### Note
“Ideation-ready” is better treated as a state than as a full stage.

---

## 1.18 Channels Matter

### Locked
Channels are part of strategy.

### Meaning
The strategy must know where the user actually writes:
- X
- Threads
- LinkedIn
- Telegram
- Newsletter
- Reels
- custom channels

They should not be ignored or deferred out of strategy.

---

## 1.19 Evidence Preferences Matter

### Locked
How the user prefers to support claims is a meaningful strategic input.

### Meaning
The strategy should eventually capture things like:
- personal observations
- examples
- case studies
- data
- screenshots
- proof signals

This is important for writing quality.

---

# 2. WORKING HYPOTHESES

These are strong current hypotheses, but not yet fully locked.

---

## 2.1 First Paying User Likely Cares More About
Current hypothesis:
- clarity
- trust
- identity
  than about
- full content factory behavior
- giant content calendars
- bulk generation

This is not fully locked yet.

---

## 2.2 Strategy Should Probably Stay Lightweight
Current hypothesis:
The strategy layer should stay:
- live
- conversational
- structured
- small enough to hold in mind

This is a strong design direction, but exact threshold is still open.

---

## 2.3 Growth / Sales Branches May Exist Without Becoming Core
Current hypothesis:
The product can support growth or sales-oriented users,
but should not become a heavy marketing machine by default.

Still open how far this should go in v1.

---

## 2.4 Platform-Specific Execution Should Likely Stay Downstream
Current hypothesis:
Deep platform adaptation should happen later in:
- angle generation
- idea generation
- writing layer

Not necessarily inside the strategy snapshot itself.

Still open how much platform-specific logic needs to be elevated.

---

## 2.5 Preferred Formats Probably Belong in Strategy
Current hypothesis:
Preferences like:
- short dense posts
- practical breakdowns
- story-led content
- short reflective notes

likely belong in Strategy, not Voice.

Still open how structured this field should be.

---

## 2.6 Expression Block Is the Right Home for Contextual Writing Preferences
Current hypothesis:
A strategy-level `expression` block is likely the cleanest place for:
- linked voice
- voice adjustments
- preferred formats
- evidence preferences
- avoid patterns

Still open whether this is the final design.

---

# 3. OPEN QUESTIONS

These are the current active frontier.
These should be the focus of future product/system design conversations.

---

## 3.1 Final Strategy Snapshot Shape
Open:
What is the final best structure of the strategy snapshot?

Still unresolved:
- exact field names
- exact nested structure
- what belongs in core vs conditional blocks
- what should be required vs optional

---

## 3.2 Goal-to-Block Mapping
Open:
Exactly which goals should activate which conditional blocks?

Examples still being refined:
- sales / leads → productContext?
- trust → expertiseContext?
- clarity → clarityContext?
- personal brand → identityContext?

---

## 3.3 Core Blocks vs Conditional Blocks
Open:
What should always exist in every strategy snapshot,
and what should only appear when Diagnose decides it is relevant?

---

## 3.4 Voice vs Strategy Boundaries
Open:
Where exactly is the cleanest split between:
- stable voice profile
- contextual expression preferences

Still unresolved:
- what belongs in Voice only
- what belongs in Strategy only
- what is derived or shared

---

## 3.5 Final Shape of the Expression Block
Open:
Should `expression` contain:
- preferredFormats
- evidencePreferences
- avoidPatterns
- voiceAdjustments
- anything else?

And in what structure:
- arrays
- freeform text
- richer objects

---

## 3.6 What Makes a Strategy “Ideation Ready”
Open:
What is the exact readiness threshold?

Not yet fully decided:
- minimum required fields
- how strict readiness should be
- whether readiness is binary or tiered

---

## 3.7 Angle / Idea Generation UX
Open:
How should angle generation and idea generation actually feel?

Questions include:
- do we generate angles first and then ideas?
- when do users choose one vs the other?
- how much is auto-generated vs explicitly requested?
- what is the best UI after strategy ends?

---

## 3.8 How Much Bulk / Branching Generation to Support
Open:
Should the product support:
- one angle → one idea → one post
  or also
- one direction → many angles → many ideas

Not decided how far to go here in v1.

---

## 3.9 Which Goal Branches Matter Most in V1
Open:
Which goal branches deserve first-class support in the first version?

Likely candidates:
- clarity
- trust
- identity
- maybe attention

Still not fully locked.

---

## 3.10 What Inputs Strategy Should Accept
Open:
Beyond starting from chat, what inputs should Strategy support well?

Examples:
- existing notes
- past posts
- writing samples
- uploaded materials
- manual context

Not fully decided how deeply each should be integrated.

---

# 4. QUESTIONS TO AVOID REOPENING LIGHTLY

The following are questions we should avoid re-litigating in new chats unless there is a strong reason:

- Should strategy exist at all?
- Should voice be merged into strategy?
- Should notes be pure text blobs with no item structure?
- Should the strategy conversation itself be the source of truth?
- Should the product become a generic AI content factory?
- Should writing be one-shot generation first?

These are currently treated as resolved enough to move forward.

---

# 5. CURRENT WORK SEQUENCE

Current recommended order of work:

1. finalize strategy snapshot structure
2. finalize dynamic blocks based on goals
3. finalize strategy stage behavior
4. finalize agent tool architecture
5. finalize ideation-ready threshold
6. move into angle / idea generation design
7. only then go deeper into downstream writing logic

---

# 6. HOW TO USE THIS DOCUMENT IN A NEW CHAT
When continuing in a new chat:

- treat everything under “Locked Decisions” as settled unless explicitly reopened
- treat “Working Hypotheses” as strong likely truths, but revisable
- treat “Open Questions” as the active design frontier

This should prevent the conversation from restarting from zero.