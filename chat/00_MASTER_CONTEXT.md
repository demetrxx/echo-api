# 00_MASTER_CONTEXT.md

## Product
Working name: **Echo**

Echo is a creator tool for turning raw thoughts into better posts without losing the user's voice.

It starts from the real moment thoughts appear:
- in the middle of the day
- while walking
- in the shower
- after a call
- from a voice note
- from a saved link
- from half-formed observations

The product is designed to reduce cognitive load, preserve authorship, and make the path from thought → clarity → post much easier.

---

## Core Thesis
Most creator tools start too late.

They start when the user is ready to “make content”.
But the real bottleneck often happens earlier:
- thoughts are captured badly
- context gets fragmented
- ideas are not revisited
- there is no clear bridge from note to post
- content strategy lives in prompts, docs, or in the user's head

Echo aims to solve this by combining:
- frictionless capture
- calm note organization
- strategy clarification
- idea / angle generation
- refine-loop writing
- voice-preserving drafting

---

## What Echo Is
Echo is a system for:
1. capturing raw thoughts
2. preserving context
3. clarifying content direction
4. generating grounded angles and ideas
5. helping the user write and refine strong posts

The product is not only a writing tool.
It is also a direction-building system.

---

## What Echo Is Not
Echo is **not**:
- a generic AI content factory
- a growth-hack prompt wrapper
- a heavy SMM dashboard
- a scheduling-first social media suite
- a Notion-like block workspace
- a rigid strategy questionnaire
- a platform-specific automation tool

The product should remain:
- simple
- calm
- human
- strategy-aware
- writing-first

---

## Current Product Direction
The current strong direction is:

**Strategy creates context and clarity.  
Writing happens through a refine-loop.**

This means:
- strategy is not the final output
- strategy is not a giant form
- strategy is not a calendar
- strategy is a live structured artifact built through conversation

The strategy layer gives:
- clarity for the user
- context for the system
- better inputs for angles, ideas, and posts

---

## Current Core Product Layers

### 1. Capture
The user can capture:
- text
- voice
- links
- files
- images

### 2. Notes
Notes are the main raw material unit.

A note has:
- one compiled readable text body
- underlying note items (text, voice, link, file, image)

Notes are designed to feel like one coherent note in the UI, while preserving structured underlying items.

### 3. Strategy
Strategy is built through:
- a persistent chat
- a live structured snapshot

The strategy snapshot is the source of truth.
The chat is the process that updates it.

### 4. Voice
Voice is a separate stable entity.
It can be created or refined during the strategy flow from examples and preferences.

Voice is not the same as strategy.

### 5. Angles / Ideas
After strategy, the product can generate:
- angles
- ideas

These will later feed the writing flow.

### 6. Writing
Writing happens in a post workspace.
The main writing philosophy is:
- not “AI writes for you”
- but “AI helps refine and articulate your thought”

---

## Current UX Model

### Strategy screen
Split layout:
- left: strategy conversation
- right: live strategy snapshot

The user talks naturally.
The agent asks questions, synthesizes, and updates the snapshot through tools.

There is no separate “refine mode”.
Refinement is just continuation of the same strategy conversation.

### Notes screen
The note is shown as a calm, readable whole.
Underlying items are secondary.
Capture actions exist as a lightweight bottom dock.

### Writing screen
Writing is based on:
- selected note(s)
- selected idea / angle
- strategy context
- voice context

The writing workspace is editor-first and refine-loop driven.

---

## Current Beliefs
These are currently treated as strong working beliefs.

1. Users do not only need writing help.  
   They need direction and continuity.

2. Strategy is valuable if it creates clarity and context.  
   It is not valuable if it becomes a bloated planning ritual.

3. Voice should stay separate from strategy as an entity, but be created/refined during strategy.

4. Themes matter, but they are not enough on their own.  
   Strategy gives higher-level direction.

5. The product should avoid becoming an “AI content machine” even if the market often sells that fantasy.

6. Refine-loop writing is a core differentiator.

---

## Current Open Design Frontier
The main unresolved area is the **Strategy module**.

Specifically:
- final strategy snapshot shape
- dynamic strategy fields based on user goals
- strategy stages
- what belongs in strategy vs voice vs write-post layer
- what should happen before angles / ideas
- what “ideation-ready” actually means

This is the current focus of product/system design.

---

## Current Canonical Flow
High-level flow:

1. Capture notes / raw material
2. Build or refine strategy
3. Generate angles / ideas
4. Open write flow
5. Draft / refine / publish

Important:
- strategy and ideation are separate
- ideation and writing are separate
- voice informs writing but is not the same as strategy

---

## Primary Product Promise
Echo helps users:
- hold onto their thoughts
- understand what they want to say
- turn that into better posts
- without feeling like the tool is replacing them

---

## Target User Direction (Current)
Not fully locked, but the current likely direction is toward users who:
- write text-first content
- have thoughts, notes, examples, and observations
- want more clarity and consistency
- dislike heavy content tools
- want help refining and articulating ideas
- may care about trust, clarity, identity, or audience growth

This likely includes:
- founders
- solo creators
- experts
- operators
- reflective writers
- business creators

Exact segmentation is still open.

---

## Attached Source-of-Truth Docs
Use the following docs together with this one:

- `01_PRODUCT_THESIS.md`
- `02_DOMAIN_MODEL.md`
- `03_STRATEGY_MODULE.md`
- `04_USER_FLOWS_AND_SCREENS.md`
- `05_DECISIONS_AND_OPEN_QUESTIONS.md`
- `06_NEXT_SESSION_PROMPT.md`

This file is only the master entry point.

---

## How To Use This In A New Chat
When starting a new chat:
1. attach this file and the supporting docs
2. tell the assistant to treat them as source of truth
3. explicitly say not to reopen locked decisions unless requested
4. continue from the current open question only

---

## Current Priority
Get the **Strategy module** into a coherent, buildable shape:
- stage model
- snapshot shape
- dynamic blocks by goals
- agent prompt/tool architecture
- clean boundaries with voice and writing

---

## One-Sentence Summary
Echo is a calm creator system that turns raw thoughts into clearer strategy, grounded ideas, and stronger posts through note capture, live strategy building, and refine-loop writing.