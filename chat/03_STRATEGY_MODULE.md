# 03_STRATEGY_MODULE.md

## Purpose
This document defines the Strategy module in Echo.

It explains:
- what strategy is
- what strategy is not
- how the strategy flow works
- how the strategy chat and strategy snapshot interact
- what the stages are
- how Voice fits into the process
- what the strategy snapshot should contain
- what “ready for ideation” means

This is the current source of truth for the Strategy layer.

---

## Strategy in One Sentence
Strategy is a live structured artifact that gives the user clarity and gives the system context before angle generation, idea generation, and writing.

---

## What Strategy Is
Strategy is:
- a direction-building process
- a structured snapshot
- a context layer
- a clarity tool for the user
- a preparation layer for ideation and writing

It helps answer:
- who am I writing for?
- why am I writing?
- what problems / tensions matter?
- what themes are active?
- how should this content be expressed in this context?

---

## What Strategy Is Not
Strategy is not:
- a content calendar
- a posting schedule
- a social media dashboard
- a one-time onboarding form
- a giant brand worksheet
- a funnel CRM
- a chat transcript
- a direct post generator

The strategy layer should not become:
- bloated
- ritualistic
- marketing-template heavy
- detached from the actual writing flow

---

## Core Product Belief
Strategy matters because it creates:
- clarity for the user
- continuity over time
- grounded inputs for angles and ideas
- better writing outputs later

Without strategy, the product becomes too generic.

Without structure, strategy becomes vague.

The Strategy module must balance both:
- natural conversation
- structured truth

---

## Core Architecture
The Strategy module has two surfaces:

### 1. Strategy Conversation
A persistent natural-language conversation between the user and the strategy agent.

Purpose:
- ask clarifying questions
- discover intent
- synthesize understanding
- refine or rethink the strategy over time

### 2. Strategy Snapshot
A live structured artifact shown alongside the conversation.

Purpose:
- hold the current agreed strategy state
- be readable and editable
- act as source of truth for downstream systems

---

## Source of Truth Rule
The conversation is **not** the source of truth.

The **strategy snapshot** is the source of truth.

The conversation exists to update the snapshot.

This is one of the most important design decisions in the system.

---

## Refinement Model
There is no separate “refine mode”.

Refinement is simply:
- reopening the same strategy conversation
- continuing naturally
- letting the agent update the current snapshot as new clarity appears

Example:
> “I understand the audience better now, let’s rethink that section.”

This should update the same strategy artifact, not create a different mode or object.

---

## Strategy Flow Overview

### Step 0
The user opens strategy creation or strategy editing.

### Step 1
A strategy conversation begins on the left.

### Step 2
A live strategy snapshot appears on the right.

### Step 3
The agent asks questions, synthesizes, and updates the snapshot through tools.

### Step 4
The user can:
- continue the conversation
- manually edit blocks
- let the agent refine specific areas naturally through chat

### Step 5
Once the strategy is good enough, the user moves to:
- angle generation
- idea generation
- or saves and exits

Strategy itself does not need to generate final posts by default.

---

## The Role of Diagnose
The first stage is not just “rapport”.

It is **diagnosis**.

The Diagnose stage is responsible for:
- understanding who the user is
- understanding why they write
- understanding for whom they write
- understanding where they publish
- inferring which strategy branches are relevant

Most importantly, Diagnose determines:
- which fields and blocks should exist in the strategy snapshot

This means strategy is not one fixed schema for everyone.
It is a dynamic schema built from goals and context.

---

## Dynamic Snapshot Principle
Some strategy blocks are always relevant.

Some are only relevant for certain goal profiles.

### Always relevant core blocks
- audience
- goals
- channels
- themes
- expression
- notes
- unresolved questions

### Conditionally relevant blocks
Examples:
- product context
- expertise context
- growth context
- identity context
- community context
- clarity context
- journey context
- destination context
- opportunity context

These are included only when Diagnose determines they are needed.

---

## Strategy Stages
The current stage model is:

```ts
STAGES_IN_ORDER = [
  StrategyStage.Diagnose,
  StrategyStage.Context, 
  StrategyStage.Direction,
  StrategyStage.Themes,
  StrategyStage.Voice,
  StrategyStage.Sharpen,
  StrategyStage.FreeRefine,
];
```

Note:
“Ideation-ready” is better thought of as a state, not necessarily a permanent stage.

Stage Definitions
1. Diagnose
   
Purpose: Understand the user's context and determine what kind of strategy scaffold is needed.

Main outputs:
- goal profile
- branch hints
- relevant snapshot blocks
- initial schema

Questions this stage answers:
- Who are you?
- Why do you write?
- Who is it for?
- Where do you publish?
- Do you already have notes, posts, or examples?

2. Context

Purpose: get the context relevant to their purpose



3. Direction
   
Purpose: Build the strategic core.

Main outputs
- audience summary
- core problems / tensions
- content goals

Questions this stage answers
- What are you really trying to say?
- What matters to your audience?
- What are the main tensions?
- Why are you publishing at all?

4. Themes
   
Purpose: Turn strategic direction into long-running content lines.

Main outputs
- active themes
- theme priority
- theme alignment with goals/problems

Questions this stage answers:
- What recurring lines of conversation should exist?
- What should content return to over time?

5. Voice

Purpose: Define how the strategy should sound and be expressed.

Main outputs
- selected or created voice
- style rules
- avoid rules
- voice adjustments for this strategy
- evidence preferences
- preferred formats

Important note: Voice is a separate stable entity, but voice creation/refinement can happen as a stage inside strategy.

This means:

Voice is not merged into Strategy as an entity
but Voice can be created or refined during the strategy process

6. Sharpen

Purpose: Remove vagueness, genericness, and internal contradictions.

Main outputs
- clearer snapshot
- narrower scope
- resolved duplicates
- better downstream quality

Questions this stage answers
- Is this strategy too broad?
- Is anything generic or repetitive?
- Are any directions conflicting?
- Is this clear enough for ideation?

7. FreeRefine

Purpose: Allow ongoing updates to the strategy through natural conversation.

Main outputs
- local snapshot updates
- strategic rethinks
- improved clarity over time

This is not only a late stage.
It is also the long-term mode strategy returns to after its initial build.


Strategy Readiness

A strategy is “ready enough” when it has enough clarity and structure to generate useful angles or ideas without collapsing into generic output.

This should not mean “perfect”.
It should mean “usable”.

Minimum likely readiness conditions

At a minimum, the strategy should usually have:

- audience summary
- multiple meaningful goals
- at least one meaningful problem / tension
- at least one active channel
- at least one active theme
- voice linked or created

This threshold may evolve.

Voice and Strategy

Voice and Strategy overlap, but they are not the same.

Voice

Stable author identity:

how the user naturally sounds
style rules
avoid rules
examples
Strategy

Current content context:

- what the user is writing for
- which themes matter now
- what channels matter now
- how the content should be expressed in this current context

Important product decision

Voice creation or refinement can happen inside the strategy flow.

This is necessary because strategy often reveals:

- how the user wants to sound
- what they dislike
- which examples represent them best
- how this specific strategy should adjust expression

Why Voice Happens Inside Strategy

Because before angles and ideas are generated, the system should understand:

- what kind of expression is natural
- what kind of language feels wrong
- what evidence style is preferred
- what post shapes feel right

So the Voice stage inside strategy is not a contradiction.
It is the point where the strategy process can:

- create a voice if none exists
- refine the current voice
- link the correct voice to the strategy

Strategy Snapshot

The strategy snapshot is the visible structured artifact on the right side of the strategy screen.

It should:

- update live
- be readable by the user
- be editable by the user
- be tool-editable by the agent
- remain the source of truth

It should be structured in blocks, not as a flat wall of fields.

Current Snapshot Shape Direction

The snapshot should include:

Core blocks
- audience
- goals
- channels
- themes
- expression
- notes
- unresolved questions

Additional goal-based blocks

Conditionally included depending on Diagnose:

- productContext
- expertiseContext
- growthContext
- identityContext
- communityContext
- clarityContext
- journeyContext
- destinationContext
- opportunityContext

This makes the strategy shape dynamic and goal-aware.

Expression Block

Expression is currently the best place to put strategy-level expression context.

This block may include:

- linked voice
- voice adjustments
- preferred formats
- evidence preferences
- avoid patterns

Expression answers:
How should content in this strategy sound and be packaged?

This is different from Voice, which answers:
What is this user’s stable authorial style?

Agent Role

The strategy agent is not a general chatbot.

It is a structured strategy clarification agent.

Its job is to:

- ask the best next question
- synthesize sharply
- avoid generic language
- update the snapshot through tools
- move strategy toward usable clarity
- not overfill fields prematurely
- not generate posts too early

Agent Tools

At a high level, the strategy agent needs tools for:

Snapshot updates
update audience
add/edit/remove goals
add/edit/remove problems
add/remove channels
add/remove themes
update expression block
update goal-specific blocks
set notes
set unresolved questions
Voice actions
create voice
update voice
link voice to strategy
Stage control
change current stage

The agent should update the snapshot through tools, not by treating the conversation as the artifact.

Why This Matters

Without tools, the strategy flow becomes fuzzy and hard to trust.

With tools:

- changes are explicit
- the snapshot stays coherent
- stage progression becomes more reliable
- the system becomes debuggable

UI Model

The intended UI is:

- Left: Strategy conversation
- Right: Live strategy snapshot

The user should be able to:

- talk naturally on the left
- see the structured result on the right
- edit the snapshot manually if needed
- continue the same conversation later

This is the core UX of the module.

Strategy Does Not End in Posts by Default

This is important.

The strategy flow should generally lead to:

- angle generation
- idea generation
- or save-and-exit

A direct path from strategy to final post may exist later as a shortcut, but it should not define the module.

The default flow is:

strategy → angles / ideas → writing

What This Module Enables Downstream

A good strategy snapshot improves:

- angle generation quality
- idea grounding
- post quality
- voice preservation
- relevance to audience and goal
- consistency over time

This is why strategy is a core layer, not a decorative one.

Current Important Open Questions

Still unresolved:

- final strategy snapshot field shape
- exact split between strategy expression and voice
- readiness threshold
- exact shape of conditional blocks
- how angles and ideas should be generated from strategy

See 05_DECISIONS_AND_OPEN_QUESTIONS.md for the active frontier.

One-Sentence Summary:

The Strategy module is a live conversation plus a live structured snapshot that turns raw user intent into a usable direction context for angles, ideas, and writing.