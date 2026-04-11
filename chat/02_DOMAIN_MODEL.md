02_DOMAIN_MODEL.md

## Purpose
This document defines the current domain model for Echo.

It explains:
- the main entities
- what each entity means
- what belongs where
- how entities relate to each other
- which boundaries are intentional
- which decisions are currently locked

This document should be treated as a source of truth unless explicitly revised.

---

## High-Level Mental Model
Echo works across five conceptual layers:

### 1. Raw Material
What the user brings into the system:
- notes
- note items
- imported writing examples
- past posts

### 2. Direction
What gives the user clarity and structure:
- strategy
- strategy conversation
- themes

### 3. Framing
What turns direction and material into usable next steps:
- angles
- ideas

### 4. Writing
What turns those steps into actual content:
- posts
- post versions

### 5. Stable Expression
What preserves authorship over time:
- voice
- voice examples

---

## Entity List
The current entity set is:

- `User`
- `Voice`
- `VoiceExample`
- `Theme`
- `Note`
- `NoteItem`
- `NoteThemeLink`
- `Strategy`
- `StrategyConversation`
- `StrategyMessage`
- `Angle`
- `AngleNote`
- `Idea`
- `IdeaNote`
- `Post`
- `PostNote`
- `PostVersion`

---

# 1. User

## Meaning
The account owner.

## Responsibility
Owns all user-specific objects:
- notes
- strategy
- voices
- themes
- posts
- ideas
- angles

## Notes
No special product logic lives here.

---

# 2. Voice

## Meaning
A stable author-expression profile.

Voice is not the same as strategy.

Voice captures:
- how the user usually sounds
- how they structure thoughts
- what kinds of phrasing feel natural
- what kinds of output feel wrong

## Voice should include
- name
- description
- TOV / tone summary
- style rules
- avoid rules

## Voice should not include
- current business goals
- active themes
- channels
- current strategy context
- content goals
- temporary direction-specific preferences

## Role in the system
Voice is a reusable stable base.
Strategy may reference a voice and temporarily adjust how it should be applied in that context.

---

# 3. VoiceExample

## Meaning
A text example used to infer or refine a Voice.

## Why it exists
Voice should not only be manually described.
It should also be grounded in actual samples.

## Typical sources
- pasted posts
- imported user content
- copied writing examples
- previously published product output (optional later)

## Role in the system
Used to:
- create a voice
- refine a voice
- re-run analysis if needed

---

# 4. Theme

## Meaning
A long-running content line.

A theme is not a post idea.
A theme is not a strategy.
A theme is not a tag cloud.

It is a durable line of conversation, for example:
- product clarity
- founder psychology
- slow creativity
- design decision-making

## Role in the system
Themes help:
- organize notes
- structure strategy
- scope angle and idea generation
- maintain continuity

## Important boundary
Themes are lower-level than strategy.
Strategy decides which themes are active or important right now.

---

# 5. Note

## Meaning
A readable, coherent note used as raw material.

A note is the main human-facing unit of captured thought.

## Important design decision
A note has:
- one compiled text body for normal UI and AI use
- underlying items for provenance and mixed media support

This is intentional.

## Why
The user should mostly experience a note as one thing.
The system can still preserve:
- text chunks
- voice recordings
- links
- files
- images

## Note is not
- a block-editor document
- a graph node
- a file manager page

## Role in the system
Notes are used for:
- raw capture
- strategy grounding
- angle generation
- idea generation
- post drafting

---

# 6. NoteItem

## Meaning
A raw component inside a note.

## Possible item types
- text
- voice
- link
- file
- image

## Why it exists
A note may be assembled from multiple real-world inputs, but the product should still show one coherent note.

## Important boundary
The user-facing canonical surface is usually the note.
The item layer exists to preserve source material and support richer capture.

---

# 7. NoteThemeLink

## Meaning
A stateful relationship between a note and a theme.

## Why this exists
Theme linkage is not binary truth.
A note can have:
- suggested theme links
- confirmed theme links
- rejected theme links

## Important design decision
Suggested and confirmed are not the same.

## Why
The system may infer likely themes, but the user can:
- confirm
- reject
- ignore
- change them

## Role in the system
Used for:
- lightweight note organization
- better strategy context
- scoped idea generation
- theme-based retrieval

---

# 8. Strategy

## Meaning
A live structured strategy snapshot.

This is the source of truth for the strategy layer.

## Strategy is
- a live structured artifact
- a direction context
- a strategy snapshot that can evolve through conversation

## Strategy is not
- a calendar
- a giant marketing worksheet
- a static questionnaire result
- a full chat transcript
- a content factory config dump

## Role in the system
Strategy helps define:
- who the user is writing for
- why they are writing
- what tensions / problems matter
- what themes are active
- how content should be expressed in this context

## Important design decision
Strategy is dynamic.
Its shape may include conditional blocks depending on user goals.

For example:
- sales-oriented strategies may include product context
- clarity-oriented strategies may include recurring questions
- trust-oriented strategies may include expertise context

---

# 9. StrategyConversation

## Meaning
The persistent strategy conversation attached to a strategy.

## Why it exists
Refinement is not a separate mode.
The user can continue the same strategy conversation over time.

## Important design decision
Strategy refinement does not create a new “refine flow”.
It resumes the same conversation, with the current snapshot as context.

## Role in the system
The conversation is:
- the process
- not the source of truth

The strategy snapshot remains the source of truth.

---

# 10. StrategyMessage

## Meaning
One message inside the strategy conversation.

## Why it exists
Needed to:
- preserve conversation history
- support natural language refinement
- give the agent context for continuing the strategy process

## Role in the system
Messages help the agent:
- ask clarifying questions
- synthesize
- update strategy through tools
- continue refinement later

---

# 11. Angle

## Meaning
A framing or take.

An angle is the way a problem or theme is approached.

Examples:
- “Most creators don’t lack ideas. They lack retrieval.”
- “Strict systems kill fragile thoughts.”
- “Multiple CTAs often signal internal confusion, not user-centric design.”

## Important boundary
Angle is not the final post.
Angle is also not the same as a theme.

### Theme
Broad line of conversation

### Angle
Specific framing inside a theme/problem space

## Role in the system
Angles are generated after strategy and before or alongside ideas.

They help:
- sharpen thinking
- create variation
- avoid generic output
- feed idea generation

---

# 12. AngleNote

## Meaning
A link between an angle and the notes that support or inspired it.

## Why it exists
Angles should stay grounded in real material where possible.

---

# 13. Idea

## Meaning
An executable content unit.

An idea is closer to something that can become a post.

## Relationship to angle
An angle is a framing.
An idea is a practical execution-oriented unit that may be based on an angle.

## Example
### Theme
Product clarity

### Angle
“Teams often ask for flexibility when what users really need is confidence.”

### Idea
“A post about how product teams confuse optionality with better UX, using a client example and one strong claim.”

## Role in the system
Ideas are the bridge into the writing flow.

## Important design direction
Posts should generally start from:
- a selected angle
- a selected idea
- or selected notes with explicit write intent

But strategy itself should not jump straight to final post output by default.

---

# 14. IdeaNote

## Meaning
A link between an idea and the notes that support it.

## Why it exists
Ideas should stay grounded in user-owned source material whenever possible.

---

# 15. Post

## Meaning
A concrete piece of content being written or prepared.

## Examples
- X post
- Threads post
- LinkedIn post
- Telegram post
- newsletter draft

## Important boundary
A post is execution.
It is not the same as:
- strategy
- theme
- angle
- note

## Role in the system
This is the main object in the write-post layer.

---

# 16. PostNote

## Meaning
A link between a post and notes used during drafting.

## Why it exists
The post may rely directly on notes, not only on ideas.

---

# 17. PostVersion

## Meaning
A version of the post text.

## Why it exists
Echo is built around refine-loop writing.
Versioning is essential to that model.

## Role in the system
Used for:
- AI edits
- user edits
- rewrite actions
- comparison / restore later

## Important boundary
Refine-loop writing depends on versions, not on replacing the whole post blindly.

---

# Core Relationships

## User
owns:
- many voices
- many themes
- many notes
- many strategies
- many angles
- many ideas
- many posts

## Voice
has many:
- voice examples

## Theme
can be linked to:
- notes
- strategies
- angles
- ideas
- posts

## Note
has many:
- note items
- note-theme links
- angle links
- idea links
- post links

## Strategy
has:
- one persistent conversation
- many messages
- many active themes
- optional linked voice
- downstream influence on angles and ideas

## Angle
can reference:
- themes
- strategy
- notes

## Idea
can reference:
- angle
- notes
- strategy
- theme

## Post
can reference:
- idea
- notes
- theme
- voice
and has many versions

---

# Canonical Product Flow
The intended high-level flow is:

1. Capture raw material into notes
2. Build or refine strategy
3. Generate angles and/or ideas
4. Open the write-post flow
5. Draft and refine the post
6. Publish

This flow can be shortened in some cases, but it is the main mental model.

---

# What Belongs Where

## Strategy layer
Belongs here:
- audience
- goals
- channels
- active themes
- strategy-specific expression context
- conditional business / clarity / growth blocks depending on goals

## Voice layer
Belongs here:
- stable tone
- style rules
- avoid rules
- examples

## Write-post layer
Belongs here:
- selected notes
- selected angle / idea
- platform
- post-specific CTA
- post-specific hook
- post-specific refinement instructions
- post versions

---

# Locked Boundaries

## Strategy != Voice
Voice is stable.
Strategy is contextual.

## Strategy != Chat
The strategy snapshot is the source of truth.
The conversation is the update process.

## Note != Block Document
Notes are coherent readable objects with underlying items.

## Theme != Strategy
Themes are durable lines.
Strategy activates and organizes them.

## Angle != Idea
Angle is framing.
Idea is execution-oriented.

## Post != Idea
A post is a concrete text asset.
An idea is a pre-writing content unit.

---

# Explicitly Rejected Directions
The following directions are currently considered wrong or out of scope:

- full note graph / note relation engine as a core dependency
- giant strategy forms
- content calendar as the center of the product
- AI content factory as product truth
- platform-specific social media dashboard as the main identity
- block-editor-first note model
- making the strategy conversation the source of truth
- merging strategy and voice into one single entity

---

# Current Important Open Questions
These remain open:
- final strategy snapshot field shape
- exact split between strategy expression fields and voice fields
- angle / idea generation UX
- ideation-ready criteria
- which goal branches are first-class in v1

See `05_DECISIONS_AND_OPEN_QUESTIONS.md` for the current frontier.
