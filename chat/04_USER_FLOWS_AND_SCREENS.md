# 04_USER_FLOWS_AND_SCREENS.md

## Purpose
This document describes the current user-facing flows and screens in Echo.

It is not a visual spec.
It is a functional map of:
- what each screen is for
- what the user can do there
- what data/context each screen should use
- how screens connect to each other

This document should help keep UX conversations aligned with the product model.

---

## Core Screen Map
The current product is centered around four primary areas:

1. **Index / Write entry**
2. **Note details**
3. **Strategy**
4. **Write post workspace**

These should feel like parts of one system, not separate mini-products.

---

# 1. Index / Write Entry

## Purpose
The index page is a **launch surface**, not a dashboard.

Its job is to help the user start the next meaningful action quickly:
- write from scratch
- start from notes
- start from an idea
- continue an existing draft

It should not feel like:
- a control panel
- a metrics dashboard
- a settings center

---

## Main Jobs
The index page should help the user do one of the following:

### A. Start writing from a raw thought
The user types a thought or fragment directly into the main composer.

### B. Start writing from existing material
The user selects:
- note(s)
- idea(s)

### C. Continue previous work
The user opens a recent draft / post.

### D. Save a new thought without writing yet
The user saves the typed content as a note.

---

## Key Elements
The current intended structure is:

### 1. Main composer
A large, calm input to:
- write a thought
- paste a note
- start from scratch

### 2. Selected context summary
A compact summary of:
- selected note count
- selected idea

Platform and voice should not dominate this screen.

### 3. Primary action
`Create post`

### 4. Secondary action
`Save note`

### 5. Source picker
A compact way to choose:
- recent notes
- recent ideas

This should not become a bloated dashboard.

---

## Important UX Principles
- The page should feel fast and calm.
- The page should minimize pre-writing decisions.
- The page should not overload the user with strategy or tool logic.
- Platform and voice selection should not dominate the index page.
- The user should be able to move into writing in under 10 seconds.

---

## Current Design Direction
Preferred structure:
- main input
- selected note/idea context
- create post
- browse/select from notes and ideas

This page is intentionally not strategy-heavy.

---

# 2. Note Details Screen

## Purpose
The note details screen is the main surface for interacting with raw material.

Its job is to:
- show the note as one coherent readable object
- allow quick continuing capture
- preserve access to underlying note items
- serve as a bridge into strategy or writing later

This screen should not become:
- a block editor
- a file manager
- a second AI workspace

---

## Main Jobs

### A. Read and lightly edit the compiled note
The note should feel like a calm readable surface.

### B. Continue capturing into the same note
The user should be able to quickly add:
- voice
- link
- file
- image
- maybe text fragment if needed

### C. Inspect source items
The user can see and manage the underlying items that make up the note.

### D. Move the note forward later
Possible future actions:
- attach / suggest theme
- use in strategy
- use in angle generation
- use in writing

---

## Current UX Model

### Main note surface
The note appears as one coherent body of text.

### Source items layer
Underlying items are visible as a secondary panel or section.

### Capture dock
A floating bottom dock lets the user quickly add:
- voice
- link
- file
- image

Voice is intended to be the primary capture action.

---

## Important Product Decision
The note is experienced as a whole.
The underlying items exist, but they are not the main object most of the time.

This is intentional.

---

## Current Design Direction
The note details screen should feel like:
- a calm private draft / note surface
- not a document editor
- not a SaaS control panel

---

# 3. Strategy Screen

## Purpose
The strategy screen is where the user builds or refines content direction.

This is a core product screen.

Its job is to:
- clarify intent
- structure direction
- build a live strategy artifact
- prepare the user for angles / ideas

It should not feel like:
- a giant form
- a marketing worksheet
- a separate mode disconnected from writing

---

## Core Layout
The intended structure is:

### Left side
Persistent strategy chat

### Right side
Live strategy snapshot

This split is one of the most important product decisions in Echo.

---

## Main Jobs

### A. Diagnose the user’s context
Understand:
- who they are
- why they write
- for whom
- where
- what material already exists

### B. Build the strategy snapshot
The agent updates structured fields over time.

### C. Refine naturally
The user can return later and continue the same conversation.

### D. Prepare for ideation
Once strategy is ready enough, the user moves to:
- angle generation
- idea generation

---

## Current UX Principles
- The chat is the process.
- The snapshot is the source of truth.
- The user should always be able to see what has been clarified.
- The user should not need to mentally reconstruct the strategy from the conversation alone.
- Refinement should feel natural, not mode-based.

---

## Strategy Stages in UX Terms
The current intended flow is:

1. Diagnose
2. Direction
3. Themes
4. Voice
5. Sharpen
6. FreeRefine (ongoing state)

“Ideation ready” is better treated as a state than as a permanent visible stage.

---

## Important Transition
The Strategy screen should usually end with:
- continue to angles
- continue to ideas
- save and leave

Not with final post writing by default.

---

# 4. Write Post Workspace

## Purpose
This is the main writing and refinement screen.

It should help the user turn:
- notes
- strategy context
- angle / idea
- voice context

into a stronger post.

This screen is editor-first.

---

## Main Jobs

### A. Start a draft from selected context
Possible inputs:
- selected note(s)
- selected idea
- selected angle
- strategy context
- voice

### B. Write and refine
The user can:
- write directly
- ask AI for local improvements
- keep ownership of the text

### C. Use quick actions
Examples:
- turn into post
- add hook
- make clearer
- shorten
- expand
- adapt to platform

### D. Manage versions
Post versions support the refine-loop model.

---

## Current Layout Direction
The intended structure is:

### Center
Main editor

### Left
Context panel
- selected idea / angle
- selected notes
- maybe theme / strategy hints

### Right
AI copilot panel
- quick actions
- custom instruction input
- maybe voice input

This screen should not feel like a crowded AI cockpit.

---

## Important UX Principles
- The editor is the main thing.
- Context supports writing, it does not dominate it.
- AI is secondary and assistive.
- Refinement should feel lightweight and precise.
- This screen is about execution, not strategy discovery.

---

# 5. Cross-Screen Flow

## Canonical Flow
The intended primary flow is:

1. Capture note(s)
2. Open / build strategy
3. Generate angles / ideas
4. Open write post workspace
5. Draft / refine / publish

---

## Shorter Valid Flows

### A. Note → Write
User skips strategy for a quick post.

### B. Strategy → Ideas later
User builds strategy and exits before writing.

### C. Existing post → Refine
User comes back to an unfinished draft.

### D. Strategy → Free refine
User revisits strategy after learning more.

These are valid, but the canonical product spine should remain clear.

---

# 6. What Belongs to Which Screen

## Index
Belongs here:
- launch into writing
- quick selection of notes / ideas
- save note

Does not belong here:
- heavy strategy
- deep voice settings
- platform strategy logic

---

## Note Details
Belongs here:
- coherent note view
- note-level editing
- add capture items
- source item inspection

Does not belong here:
- full strategy builder
- heavy AI chat
- giant content planning

---

## Strategy
Belongs here:
- clarification
- diagnosis
- strategy snapshot
- voice creation/refinement as part of strategy
- preparing for ideation

Does not belong here:
- final post drafting
- content calendar as core
- social dashboard behavior

---

## Write Post Workspace
Belongs here:
- post drafting
- post refinement
- post-specific platform adaptation
- post versions
- local AI help

Does not belong here:
- broad strategy discovery
- note system management
- giant strategy forms

---

# 7. Layer Boundaries by Screen

## Strategy layer
Primary screens:
- Strategy screen

Touches:
- themes
- voice
- channels
- goals
- audience
- expression preferences

---

## Voice layer
Primary interaction point:
- inside Strategy flow

Touches:
- voice creation
- voice refinement
- voice selection

Stable voice is separate from write-post execution.

---

## Write-post layer
Primary screen:
- Write post workspace

Touches:
- selected notes
- selected angle / idea
- post-specific formatting
- platform adaptation
- refinement actions

---

# 8. Current Open UX Questions
These are still unresolved:

- what the post-angle/idea generation screen should look like
- how the user transitions from strategy into angles / ideas
- whether angles and ideas live on one screen or two
- how much manual editing the strategy snapshot should allow
- how much of strategy context should be shown in the write-post screen
- how much item detail should be visible on the note screen by default

See `05_DECISIONS_AND_OPEN_QUESTIONS.md` for broader open design questions.

---

# 9. One-Sentence Summary
Echo’s UX should feel like one calm system where notes preserve raw material, strategy creates clarity, and the writing workspace turns selected context into strong posts through refinement.