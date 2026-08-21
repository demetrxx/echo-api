# Capabilities and guided flows

## Purpose

Этот документ является каталогом того, что AI-QA может запускать отдельно и
в составе guided flow. Он не обещает, что все entries уже реализованы.

Статусы:

- `ready` — существующий product service можно обернуть без изменения его
  смысла;
- `limited` — service существует, но есть важные ограничения;
- `deferred` — не включать в v1 runner до завершения product capability;
- `support` — технический шаг flow, не самостоятельная AI quality target.

## Общий capability contract

Каждая capability должна определить:

```text
key
label
status
product service
input schema
smart context resolver
executor
serializable output
artifacts
default rubric
allowed next capabilities
```

Context preview и execution используют один resolver. Preview не выполняет
LLM calls и не изменяет БД.

## Strategy

### `strategy.create`

- Status: `support`.
- Service: `StrategyService.create`.
- Purpose: создать начальную Strategy и conversation для последующих turns.
- Input:
  - optional name;
  - optional initial snapshot overrides.
- Output:
  - strategy ID;
  - stage/status;
  - initial snapshot;
  - initial conversation history.
- Artifacts:
  - `strategyId`.
- Default review: отсутствует; это setup step.

### `strategy.message`

- Status: `ready`, но stateful.
- Service: `StrategyService.messageAgent`.
- Input:
  - `strategyId`;
  - user message.
- Smart defaults:
  - active или явно выбранная sandbox strategy;
  - current conversation/snapshot из БД.
- Output:
  - assistant message;
  - updated stage;
  - updated snapshot;
  - tool actions/state diff;
  - conversation history delta.
- Artifacts:
  - strategy ID;
  - created/updated theme/voice IDs, если они появились.
- Risks:
  - tool side effects;
  - multi-turn context;
  - nondeterminism;
  - prompt/state logging.

Default rubric:

1. `usefulness` — ответ помогает продвинуть strategy.
2. `specificity` — agent использует контекст, а не общие вопросы.
3. `stage_discipline` — не перепрыгивает этап и не делает преждевременную
   генерацию.
4. `snapshot_quality` — structured state обновлён корректно и без
   выдуманных данных.
5. `tone` — диалог не выглядит как тяжёлая анкета или назидание.

Suggested anchors для `snapshot_quality`:

- `2`: snapshot не изменён либо содержит неподтверждённые факты;
- `5`: часть полезной информации сохранена, но важные details потеряны;
- `8`: подтверждённые данные отражены точно и минимально;
- `10`: snapshot точно отражает решение и заметно улучшает дальнейший
  context без лишних полей.

## Ideas

### `ideas.suggest`

- Status: `ready`.
- Services:
  - `IdeaService.suggest`;
  - `IdeaGeneratorService.suggest`.
- Input:
  - amount;
  - optional theme ID;
  - optional selected note IDs;
  - optional strategy/voice IDs, если product API позволяет explicit choice.
- Smart defaults:
  - current sandbox user;
  - selected notes, если они указаны;
  - active strategy;
  - explicit voice, иначе product default;
  - explicit theme, если указан.
- Output:
  - generated ideas с IDs, names, angles и relations;
  - raw/parse diagnostics при доступности.
- Artifacts:
  - `ideaIds`.

Default rubric:

1. `grounding` — ideas используют переданный material.
2. `specificity` — идея не является generic topic.
3. `novelty` — идеи не повторяют друг друга и очевидную history.
4. `strategy_fit` — результат поддерживает текущую direction.
5. `writeability` — из idea можно перейти к конкретному post.

Suggested anchors для `grounding`:

- `2`: выбранные notes практически не повлияли на result;
- `5`: совпала общая тема, но конкретная мысль потеряна;
- `8`: минимум одна idea ясно развивает конкретную source note;
- `10`: material использован глубоко, точно и без неподдержанных claims.

### `ideas.suggest_with_notes`

Alias/preset над `ideas.suggest`, который требует explicit note IDs. Полезен
для atomic grounding tests. Не должен иметь отдельную executor
implementation.

## Posts

### `post.create`

- Status: `support`.
- Service: `PostService.create`.
- Input:
  - platform;
  - optional idea/theme/strategy/voice/note IDs;
  - optional starting text.
- Output:
  - post;
  - initial version.
- Artifacts:
  - `postId`;
  - initial version ID.
- Review:
  - только state/technical checks, если LLM не вызывается.

### `post.refine`

- Status: `ready`.
- Services:
  - `PostService.refine`;
  - `PostRefineService.refine`.
- Input:
  - post ID;
  - refinement request.
- Smart defaults:
  - current post;
  - selected note/theme/idea/strategy context;
  - product-resolved platform/voice;
  - version history.
- Output:
  - refined text;
  - created `PostVersion`;
  - prior/current version comparison.
- Artifacts:
  - `postId`;
  - `postVersionId`.
- Important check:
  - context preview должен показать, был ли voice действительно передан
    production path, а не только доступен в entity.

Default rubric:

1. `instruction_fit` — выполнен конкретный request.
2. `meaning_preservation` — исходная мысль не подменена.
3. `grounding` — сохранён relevant source context.
4. `voice_fidelity` — текст соответствует voice examples/rules.
5. `writing_quality` — ясность, структура и конкретность улучшились.

Suggested anchors для `instruction_fit`:

- `2`: request проигнорирован или выполнено противоположное;
- `5`: направление верное, но изменение неполное или чрезмерное;
- `8`: request выполнен точно без ненужной переработки;
- `10`: request выполнен точечно и заметно улучшил текст.

## Voice

### `voice.adapt_text`

- Status: `limited`.
- Service: `VoiceService.adaptText`.
- Input:
  - voice ID;
  - text;
  - platform.
- Smart defaults:
  - active/selected voice;
  - primary profile platform.
- Output:
  - adapted text;
  - selected relevant examples, если service может их вернуть без изменения
    product semantics.
- Risks:
  - embedding search dependency;
  - нет отдельного app endpoint;
  - evaluator должен различать style fit и content quality.

Default rubric:

1. `voice_fidelity`;
2. `meaning_preservation`;
3. `non_caricature`;
4. `platform_fit`;
5. `naturalness`.

### `voice.calibration_start`

- Status: `limited`.
- Service: `VoiceCalibrationService.start`.
- Input:
  - voice ID.
- Output:
  - calibrated voice data;
  - generated samples;
  - calibration step.
- Risks:
  - capability сама вызывает Idea generation и Post refine;
  - создаёт несколько product artifacts;
  - стоимость и latency выше atomic calls;
  - hard JSON parse failures возможны.

Default rubric:

1. `profile_accuracy`;
2. `rule_quality`;
3. `avoid_rule_quality`;
4. `sample_fidelity`;
5. `non_caricature`.

### `voice.calibration_feedback`

- Status: `limited`.
- Service: `VoiceCalibrationService.addFeedback`.
- Input:
  - voice ID;
  - human feedback.
- Output:
  - new calibration step;
  - updated samples.
- Используется в guided voice flow после operator review.

## Notes and transcription

### `note.create`

- Status: `support`.
- Service: `NoteService.create`.
- Purpose: setup/capture step.
- Output:
  - note ID;
  - compiled text.
- Auto-title не включать в quality score без явного ожидания completion.

### `note.title`

- Status: `limited`.
- Service: `NoteService.generateTitle`.
- Особенность: internal/asynchronous product path.
- Может быть добавлена как отдельный atomic test после появления безопасного
  явного invocation/wait contract.

### `voice.transcribe`

- Status: `ready`, если test profile содержит audio asset.
- Service: `LlmService.voiceToText` или product service endpoint.
- Input:
  - audio file reference.
- Output:
  - transcription text.
- Default rubric:
  - factual transcription accuracy;
  - completeness;
  - language;
  - punctuation/readability.
- Synthetic JSON fixtures сейчас не содержат audio assets, поэтому capability
  не блокирует основной v1.

## Deferred capabilities

### `theme.suggest`

- Status: `deferred`.
- Reason:
  - `ThemeSuggestService` не вызывает LLM;
  - service не завершён и не включён в устойчивый product flow.

### Signals/retrieval

- Status: `deferred`.
- Reason:
  - Source/Document/Chunk/PostContext runtime отсутствует;
  - queue содержит только ранний задел.

## Guided flows

Guided flow — code-defined ordered list. UI не редактирует topology.

### `notes_to_ideas`

Purpose: проверить grounding Idea generation.

```text
1. Select existing notes
2. ideas.suggest
3. Operator reviews and optionally selects an idea
```

Required profile data:

- минимум 3 notes;
- optional strategy/theme/voice.

Step-level review:

- Idea rubric.

Completion:

- Run может закончиться без selection;
- selection сохраняется, если оператор продолжает другой flow.

### `notes_to_idea_to_post`

Purpose: небольшой composite flow через центральный product value.

```text
1. Select notes
2. ideas.suggest
3. Operator selects idea
4. post.create
5. post.refine with "Write the post" или выбранным request
6. Review final post
```

Required profile data:

- notes;
- platform;
- желательно strategy и voice.

Important:

- result Idea step оценивается отдельно;
- final Post не должен скрывать upstream Idea failure;
- operator selection записывается в Step.

### `strategy_guided_conversation`

Purpose: проверить несколько turns и развитие snapshot.

```text
1. strategy.create или выбрать existing strategy
2. strategy.message
3. Review response and snapshot diff
4. Operator вводит/подтверждает следующий message
5. strategy.message
6. Repeat до заданного количества turns или Stop
```

Default v1:

- 3 scripted/editable user messages;
- без автоматического решения, что Strategy «готова»;
- каждый turn получает отдельный review.

### `strategy_to_ideas_to_post`

Purpose: проверить основной product flow вкупе.

```text
1. Select existing strategy or create one
2. 1–3 strategy.message turns
3. Select notes/theme
4. ideas.suggest
5. Operator selects idea
6. post.create
7. post.refine
8. Final review
```

Это наиболее дорогой и nondeterministic flow. Добавлять после устойчивой
работы atomic capabilities и `notes_to_idea_to_post`.

### `voice_calibration_to_post`

Purpose: проверить, что derived voice работает на samples и реальном post.

```text
1. Select voice with examples
2. voice.calibration_start
3. Review samples
4. Optional voice.calibration_feedback
5. Create/refine a post with resulting voice
6. Review voice fidelity
```

Добавлять после базовой Profile materialization и Post runner.

## Smart context rules

### Общие

- Все IDs должны принадлежать sandbox user.
- Explicit operator selection имеет приоритет над defaults.
- Preview показывает source каждого значения:
  - `product_default`;
  - `case`;
  - `operator_override`;
  - `prior_step`.
- Resolver не должен выбирать записи без deterministic order.
- Resolved context полностью сохраняется в Run.

### Strategy

- выбрать explicit strategy ID;
- иначе active strategy;
- если active несколько, вернуть ambiguity вместо случайного выбора;
- conversation и snapshot всегда читаются непосредственно перед execution.

### Ideas

- explicit note IDs;
- explicit theme;
- active strategy;
- explicit voice или product default;
- amount from Case/default.

### Post

- post ID обычно приходит из prior step или explicit selection;
- context должен соответствовать реальному `PostService.refine` path;
- preview показывает idea/theme/strategy/voice/note relations и versions.

### Voice

- explicit voice ID;
- platform from input, затем profile primary platform;
- examples from selected voice;
- embedding-dependent choices фиксируются в execution diagnostics, если это
  доступно.

## Rerun policies

### Exact context

Использовать для baseline/candidate:

- те же selected IDs;
- те же operator inputs;
- та же rubric;
- тот же profile snapshot;
- новый isolated sandbox state, если execution мутирует данные.

### Product defaults

Использовать для проверки нового end-user behavior:

- resolver выполняется заново;
- Run сохраняет новый context;
- сравнение предупреждает, если resolved context отличается.

## Default rubrics are proposals

Приведённые criteria — стартовые defaults. Suite/Case может выбрать
подмножество или добавить criterion. Каждый Run сохраняет exact rubric
snapshot. Нельзя сравнивать aggregate score двух Runs как эквивалентный, если
rubric materially отличается.
