# Screen specifications

## Общие правила

- Screen specs не фиксируют frontend framework.
- Route names conceptual и адаптируются к существующей admin routing.
- Main action всегда одна.
- Technical details скрыты до раскрытия.
- Server state является source of truth для Runs/materialization.
- Empty/error/loading states проектируются вместе с happy path.

## Navigation

Минимальные items:

- AI Tests;
- Profiles;
- Runs;
- Tests;
- Issues;
- System Versions.

`Cases` и `Suites` находятся внутри Tests. Compare открывается из context,
а не обязан быть отдельным menu item.

---

# 1. AI Tests Home

## Purpose

Начать тест за несколько действий и продолжить незавершённую работу.

## Primary area — Quick Test

Controls:

1. Profile selector.
2. System Version selector.
3. Mode:
   - Single capability;
   - Guided flow.
4. Capability/Flow selector.
5. `Continue` to Context Preview.

Defaults:

- last used ready Profile;
- current available System Version;
- last mode/capability только если это не создаёт surprise.

## Secondary content

- Paused Runs: максимум несколько последних.
- Recent Runs: компактный список.
- Open Issues requiring rerun: компактный список/count.

Не показывать:

- charts;
- score trends;
- leaderboard segments;
- team activity.

## Empty states

### No Profiles

Message:

> Для теста нужен изолированный Test Profile.

Actions:

- Import bundled fixture;
- Create with AI.

### No System Version

Action:

- Capture current.

Если backend может вернуть synthetic `current`, разрешить Quick Test и
предложить capture для comparison later.

## Loading/error

- Selectors могут загружаться независимо.
- Если capability catalog недоступен, Quick Test disabled с Retry.
- Recent Runs error не блокирует создание нового Test.

---

# 2. Profiles List

## Purpose

Найти/создать тестового пользователя и понять готовность sandbox.

## List item

- Name.
- Segment.
- Source: AI / Fixture / Clone.
- Status.
- Counts: notes/themes/post samples.
- Last materialized/updated.
- Primary action:
  - Open;
  - Continue draft;
  - Retry materialization.

## Filters

- Segment;
- Source;
- Status;
- Search.

## Actions

- New Profile;
- Import fixture.

## Empty/error

- No result for filters → clear filters.
- Global empty → onboarding actions.
- Row materialization failed → visible status, no silent fallback.

---

# 3. New Profile source chooser

## Options

### Generate with AI

Free-form Seed Assistant + structured draft.

### Import

Bundled fixture, file/upload или JSON paste depending existing admin
capabilities.

### Clone user

Source user selection + limits + confirmation.

### Start blank

Manual structured editor. Optional, secondary.

Каждая option кратко объясняет:

- скорость;
- control;
- privacy implications.

---

# 4. Profile Detail / Seed Assistant

## Layout

### Header

- Name.
- Segment/source.
- Draft/sandbox status.
- Save.
- Prepare/Rematerialize sandbox.
- Start Quick Test, только ready.

### Structured Profile

Sections:

- Identity;
- Goals;
- Pillars/Themes;
- Voice;
- Notes;
- Strategy;
- History;
- Suggested Tasks.

Large note/sample collections:

- searchable;
- collapsible;
- bulk select;
- counts visible.

### Assistant panel

- conversation;
- selected profile paths;
- proposed changes;
- Apply/Reject/Undo.

Не смешивать Assistant messages с Profile fields.

## Change behavior

- Manual local edit применяется к draft.
- Assistant local edit может примениться сразу с Undo.
- Bulk/destructive edit показывает diff.
- После sandbox ready любое definition change показывает `Sandbox out of
date`.

## Materialization status

States:

- not prepared;
- materializing;
- ready;
- out of date;
- failed;
- archived.

Ready summary:

```text
Sandbox ready
62 Notes · 5 Themes · 1 Strategy · 1 Voice
```

## Errors

- Validation показывает exact field path.
- Assistant failed не ломает manual editor.
- Materialization failed сохраняет draft и показывает safe retry.

---

# 5. Context Preview

## Purpose

Подтвердить, что AI получит ожидаемый product context, не превращая запуск в
длинную форму.

## Header

- Profile;
- System Version;
- Capability/Flow;
- `Run`.

## Compact summary

Каждый context row:

- type;
- summary/count;
- source badge;
- expand;
- override/remove, если capability разрешает.

Example:

```text
Notes          3 selected                    Operator override
Strategy       Active: Founder direction    Product default
Theme          Friction vs features         Product default
Voice          Artem default                Product default
Previous posts 5                            Product default
```

## Input controls

Capability-specific fields:

- amount;
- user request/message;
- platform;
- selection.

Generic JSON editor не является default. Он может быть advanced fallback.

## Warnings

- ambiguity;
- missing optional context;
- stale sandbox;
- expensive flow;
- exact context unavailable.

Warnings различают:

- blocker;
- informational.

## Actions

- Run;
- Save as Case draft, optional;
- Reset overrides;
- Back.

---

# 6. Runner

## Purpose

Выполнить один или несколько Steps, увидеть результат и решить следующий
action.

## Header

- Run ID/name.
- Profile.
- System Version.
- Atomic/Flow label.
- Status.
- Cancel/Finish.

## Guided progress

Простой linear indicator:

```text
1 Notes/Context ✓
2 Ideas current
3 Select idea
4 Post
```

Не показывать branch graph.

## Current Step card

### Input summary

- collapsed by default;
- expand показывает resolved context/source;
- operator overrides highlighted.

### Execution state

- Ready → Run Step;
- Running → progress and elapsed time;
- Completed → Result;
- Failed → error + Retry;
- Skipped.

### Result

Renderer by capability:

- Ideas: list cards + select;
- Post: formatted text + prior version compare;
- Strategy: product response + snapshot diff + tool actions;
- Voice: profile/rules + samples;
- Generic fallback: structured JSON/markdown.

### Actions

Depending backend `nextActions`:

- Retry;
- Select;
- Continue;
- Continue to ...;
- Skip;
- Stop/Finish.

UI не придумывает недоступный transition.

## Step history

Previous completed Steps доступны сверху/слева. Открытие history не меняет
current Step. Retry attempts отображаются внутри одного Step.

## Details drawer

- full input;
- resolved context;
- model/prompt identifiers;
- raw/parsed output, если доступно;
- artifact IDs;
- duration;
- technical error.

## Strategy special case

Main area содержит product conversation. Следующий operator message —
отдельный composer.

Review Assistant:

- отдельный label/color/position;
- не имеет общей кнопки Send с Strategy composer.

## Long-running behavior

- UI poll/refreshes server state according to existing admin patterns.
- Reload восстанавливает Run by ID.
- Duplicate execute disabled while server state running.

---

# 7. Review panel

## Purpose

Быстро принять/скорректировать AI оценку.

## AI Review

- Overall 1–10.
- Summary.
- Criteria rows:
  - score;
  - rationale;
  - anchors.
- Suggested issue, optional.

States:

- not requested;
- pending;
- completed;
- failed with Retry.

AI review failure не меняет Step result.

## Human Review

Default:

- `Accept AI scores`;
- edit overall;
- expand/edit criteria;
- comment;
- Save.

Display:

```text
Grounding
AI 7
You 5
```

Если human отсутствует, effective score обозначается как AI-only.

## Issue action

`Mark issue` prefill из active Step/review. Operator подтверждает.

## Accessibility/input

- Score выбирается не только slider: number buttons/input.
- Anchors доступны без hover-only behavior.
- Keyboard navigation для 1–10.

---

# 8. Run Summary / Detail

## Purpose

Понять весь flow и выбрать следующий шаг.

## Summary

- Profile;
- System Version;
- context policy;
- status/duration;
- overall AI/human/effective score;
- comments;
- Issues.

## Steps

Vertical list:

```text
Strategy  7/10
Ideas     4/10
Post      6/10
```

Каждый раскрывается до result/review/details.

## AI flow summary

Короткая optional помощь:

- strengths;
- first likely quality drop;
- downstream effect;
- suggested next check.

Не называть hypothesis доказанным root cause.

## Primary actions

- Run again;
- Compare;
- Save as Case;
- Add existing Case to Suite;
- Continue paused Run.

## Error/partial

Partial/failed Run всё равно имеет detail и может стать origin Issue. Save as
Case разрешён, если definition достаточно валидна.

---

# 9. Runs List

## Columns

- Date;
- Profile;
- Capability/Flow;
- System Version;
- Status;
- Effective score;
- Issues;
- Source: ad-hoc/Case/Suite.

## Filters

- Profile/segment;
- capability/flow;
- System Version;
- status;
- score range;
- has issues;
- date.

No charts in v1.

---

# 10. Cases

## List

- Name;
- Segment;
- Atomic/Guided;
- Capability/Flow;
- Profile;
- Latest score;
- Open Issues;
- Last run.

Actions:

- Run;
- Open;
- Add to Suite;
- Archive.

## Detail

- Purpose/description;
- initial context/input;
- sequence;
- rubric;
- source Run;
- run history;
- open Issues.

Editing affects future Runs only; warning visible.

## Create from Run

Prefilled review form:

- name;
- segment;
- Profile;
- definition summary;
- context policy;
- rubric.

Output не показывается как expected field.

---

# 11. Suites

## List

- Name;
- Segment;
- Cases count;
- Baseline;
- Last guided run;
- Open Issues.

## Detail

- ordered Cases;
- reorder;
- add/remove;
- default rubrics;
- baseline System Version;
- Start guided run.

## Guided suite progress

```text
Case 2 of 6
Completed 1 · Skipped 0 · Remaining 5
```

Finish Suite Summary:

- per-Case scores;
- comparison to baseline if available;
- Issues;
- no heavy trend dashboard.

---

# 12. Issues

## List

- Title;
- Severity;
- Status;
- Capability;
- Segment/Profile;
- Origin Run;
- Updated.

Filters:

- Open/Fixed/Ignored;
- Severity;
- Capability;
- Segment.

## Detail

- title/description;
- origin output/review link;
- related Case;
- status;
- resolution Run;
- action `Rerun`.

No threaded comments/assignee.

## Status update

For Fixed:

- select resolution Run where possible;
- allow explicit manual fixed with warning.

---

# 13. System Versions

## List

- Label;
- Role;
- Available/historical;
- Code revision;
- Dirty flag;
- Models summary;
- Created.

Actions:

- Capture current;
- Mark baseline/candidate;
- View details;
- Archive label.

## Detail

- immutable captured metadata;
- Runs/Cases using version;
- compare action.

No prompt/model editor.

---

# 14. Compare

## Header

- Case/Profile.
- Baseline Run/Version.
- Candidate Run/Version.
- Context/rubric comparability status.

## Warnings

- context differs;
- rubric differs;
- Profile snapshot differs;
- one version unavailable;
- one Run incomplete.

## Side-by-side

Per Step:

- input/context differences;
- output;
- AI/human scores;
- criteria deltas;
- comments/issues.

## Preference

- Baseline better;
- Candidate better;
- Tie;
- Incomparable.

Optional comment and `Mark regression issue`.

## AI diff

Explicit action if it incurs LLM call. Result:

- improvements;
- regressions;
- neutral changes;
- confidence/limitations.

---

# Shared component/state requirements

## Score control

- Integer 1–10.
- Label + current value.
- Visible anchors.
- AI/human distinction.
- N/A only where rubric permits.

## Status badges

Consistent meanings for:

- Profile;
- Run;
- Step;
- Issue;
- System Version.

Не использовать только цвет.

## Confirmation

Required:

- real clone;
- rematerialize sandbox;
- cancel running flow;
- archive Case/Suite/Profile;
- destructive bulk Profile change.

Not required:

- save ordinary human review;
- local draft edit;
- start ordinary atomic Step after explicit Run button.

## Error display

Always show:

- human message;
- stable error code;
- retry if safe;
- details drawer for technical data.

Не показывать:

- secrets;
- full stack trace by default;
- raw provider response containing sensitive data without permission.
