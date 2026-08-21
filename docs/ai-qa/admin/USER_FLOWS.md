# Admin user flows

## Общая модель

Оператор может войти в систему тремя путями:

1. `Quick Test` — хочу проверить что-то сейчас.
2. `Profile` — сначала нужен тестовый пользователь.
3. `Issue/Case` — хочу воспроизвести уже известную ситуацию.

Все пути сходятся в одном Runner.

## Flow 1 — First use

### Trigger

Оператор впервые открывает AI Tests, Profiles отсутствуют.

### Steps

1. Home показывает empty state и primary action `Create Test Profile`.
2. Оператор выбирает:
   - `Generate with AI`;
   - `Import fixture`;
   - `Clone user`.
3. Для первого запуска UI рекомендует импорт одного из existing fixtures.
4. После сохранения Profile предлагает `Prepare sandbox`.
5. UI показывает materialization progress.
6. После ready — `Start Quick Test`.

### Success

Оператор попадает в New Quick Test с выбранным Profile.

### Errors

- Import validation error → показать path и объяснение.
- Materialization error → показать retry/rematerialize, не скрывать partial
  failure.
- Нет admin access → отдельный unauthorized state, не product login error.

## Flow 2 — AI-assisted Profile

### Trigger

`Profiles → New → Generate with AI`.

### Steps

1. Открывается split view:
   - chat;
   - structured draft.
2. Оператор свободно описывает пользователя и цель.
3. Assistant отвечает:
   - что понял;
   - какие assumptions сделал;
   - какой draft предлагает.
4. Draft заполняется sections:
   - Identity;
   - Goals;
   - Themes/Pillars;
   - Voice;
   - Notes;
   - Strategy;
   - History.
5. Оператор:
   - редактирует inline;
   - просит локальное изменение;
   - принимает/отклоняет bulk diff;
   - undo.
6. Нажимает `Save draft`.
7. Нажимает `Prepare sandbox`.

### AI behavior

- Не задавать длинную обязательную анкету.
- Задать только вопрос, materially меняющий dataset.
- Не улучшать намеренно noisy notes.
- Не регенерировать весь Profile из-за локальной команды.
- Отдельно показывать assumptions.

### Success

Profile status `ready`, sandbox summary показывает созданные product entities.

### Exit without materialization

Draft можно сохранить и покинуть. Такой Profile виден в list, но заблокирован
для Run.

## Flow 3 — Import fixture

### Trigger

`Profiles → New → Import`.

### Steps

1. Оператор выбирает один bundled fixture или вставляет/upload JSON.
2. UI показывает validation preview:
   - segment;
   - notes counts;
   - post samples;
   - missing optional sections.
3. Оператор задаёт display name/segment при необходимости.
4. Save draft.
5. Materialize.

### Existing bundled choices

- founder operator;
- expert educator;
- reflective writer.

### Important

`expected_tasks` импортируются как suggestions, но не создают Cases без
оператора.

## Flow 4 — Clone real user

### Trigger

`Profiles → New → Clone user`.

### Steps

1. Найти source user.
2. Выбрать limits:
   - notes count/date range;
   - include strategy;
   - include voice;
   - include posts.
3. UI явно сообщает:
   - source read-only;
   - будет создан sandbox;
   - какие данные могут содержать PII.
4. Оператор подтверждает clone.
5. Materialization создаёт sandbox.
6. Profile detail показывает source reference и clone summary.

### Safety

- Никакой кнопки `Run` напрямую на real user.
- Clone confirmation — отдельное явное действие.
- Rematerialize меняет только sandbox.

### Failure

При ошибке source user не меняется; UI показывает clone failed и retry.

## Flow 5 — Atomic Quick Test

### Trigger

Home → `Start Quick Test`.

### Steps

1. Выбрать Profile.
2. Выбрать System Version, default current.
3. Выбрать `Single capability`.
4. Выбрать capability, например Ideas.
5. UI запрашивает context preview.
6. Оператор видит compact summary.
7. При необходимости открывает context и добавляет override.
8. Нажимает `Run`.
9. Runner показывает pending/running.
10. После completion:
    - output;
    - AI Review;
    - human review controls;
    - comment/Issue;
    - Retry/Finish/Continue to next capability.
11. Finish → Run Summary.

### Success

Run сохранён даже без human review. Home показывает его в Recent Runs.

### Technical failure

- Step card показывает error code/message.
- Actions: Retry, Edit input/context, Stop.
- AI quality review не запускается для отсутствующего output.

## Flow 6 — Guided Notes → Ideas → Post

### Trigger

Quick Test → Guided Flow → `Notes → Ideas → Post`.

### Steps

1. Context preview показывает selected/default notes, strategy, voice, theme.
2. Execute Ideas.
3. AI review появляется.
4. Оператор оценивает Ideas.
5. Выбирает одну Idea.
6. Нажимает `Continue to Post`.
7. Post create выполняется как support Step.
8. Post refine генерирует text.
9. Оператор оценивает Post.
10. Finish.

### Quality failure

Если Ideas плохие, оператор может:

- Retry Ideas;
- выбрать всё равно одну Idea и продолжить, чтобы увидеть downstream impact;
- Stop.

UI не блокирует Continue только из-за низкого quality score.

### Required record

Run хранит:

- оба Idea attempts;
- выбранную Idea;
- input Post step;
- final output;
- reviews каждого quality Step.

## Flow 7 — Guided Strategy

### Trigger

Quick Test → Strategy guided conversation.

### Steps

1. Select/create Strategy.
2. Первый scripted message prefilled из Case/Profile, editable.
3. Execute Strategy turn.
4. Result показывает:
   - assistant response;
   - snapshot diff;
   - tool side effects.
5. Review Assistant оценивает turn.
6. Оператор:
   - вводит следующий message;
   - использует suggested message;
   - retry;
   - stop.
7. После выбранного числа turns — Summary.

### Visual separation

- Product Strategy chat находится в main content.
- Review Assistant находится в отдельной labelled area.
- Ни один review message не отправляется Strategy Agent.

## Flow 8 — Guided Voice calibration

### Trigger

Quick Test → Voice calibration.

### Steps

1. Context preview: voice, platforms, examples.
2. Start calibration.
3. Show derived voice data и generated samples.
4. AI review.
5. Operator может:
   - finish;
   - оставить product calibration feedback;
   - execute feedback step.
6. Optional Post step проверяет применимость Voice.
7. Final review.

### Cost visibility

Flow может делать несколько LLM calls. До запуска показать краткое
предупреждение, но не строить сложный cost estimator.

## Flow 9 — Continue an ad-hoc test

### Trigger

Atomic output возвращает allowed next capabilities.

### Steps

1. Operator нажимает `Continue to Post`.
2. Backend добавляет следующий guided Step.
3. Новый Step использует artifacts предыдущего.
4. Run становится guided, но history сохраняется.
5. В конце можно Save as Case.

Это простой способ создавать custom linear flow без visual builder.

## Flow 10 — Retry

### Inside active Run

1. Нажать `Retry`.
2. Выбрать:
   - same input/context;
   - edit request;
   - edit context.
3. Новый attempt появляется рядом/после старого.
4. AI review сравнивает attempts по запросу.
5. Operator выбирает result для продолжения.

### Rule

Retry не удаляет и не перезаписывает первый output.

## Flow 11 — Rerun completed Run

### Trigger

Run Summary → `Run again`.

### Choice

- `Reproduce exact`;
- `Run as product now`.

### Steps

1. Выбрать System Version.
2. Preview показывает:
   - profile snapshot/source;
   - context policy;
   - potential warnings.
3. Создаётся новый Run.
4. Старый Run доступен для compare.

### Warning cases

- old version unavailable;
- sandbox rematerialized;
- exact IDs missing;
- rubric changed;
- context differs.

## Flow 12 — Human review

### Trigger

Completed quality Step.

### Steps

1. AI Review автоматически или по кнопке выставляет criteria 1–10.
2. Operator читает rationale.
3. Нажимает `Accept AI scores` либо меняет:
   - overall;
   - individual criteria.
4. Добавляет optional comment.
5. Save.

### UX rules

- Integer only.
- Anchors доступны рядом с criterion.
- AI и human scores видны отдельно.
- Human score не скрывает AI history.
- Comment не обязателен для каждой оценки.

## Flow 13 — Mark Issue

### Trigger

Run/Step → `Mark issue`.

### Steps

1. Dialog prefilled:
   - Run;
   - Step/capability;
   - AI suggested title, если есть.
2. Operator задаёт:
   - title;
   - description;
   - severity.
3. Save.
4. Issue status `open`.

### Resolution

1. Открыть Issue.
2. `Rerun related Case/Run`.
3. После результата:
   - Still present;
   - Fixed;
   - Ignore.
4. При Fixed связать resolution Run.

### Non-goal

Нет threaded comments, assignment и workflow states.

## Flow 14 — Save Run as Case

### Trigger

Run Summary → `Save as Test Case`.

### Steps

1. UI prefill:
   - name;
   - segment;
   - Profile;
   - sequence;
   - selected inputs;
   - context policy;
   - rubric.
2. Operator редактирует description/criteria.
3. Save.
4. Optional `Add to Suite`.

### Rule

Старый output виден как origin, но не становится hidden expected answer.

## Flow 15 — Create and run Suite

### Create

1. Tests → Suites → New.
2. Name + segment.
3. Выбрать Cases и порядок.
4. Optional baseline System Version.
5. Save.

### Run

1. Open Suite → `Start guided run`.
2. Первый Case открывается в Runner.
3. Finish/Skip.
4. Next Case.
5. Suite Summary:
   - completed/skipped;
   - scores;
   - issues;
   - baseline deltas, если доступны.

### Rule

Cases не запускаются автоматически в background.

## Flow 16 — Baseline vs Candidate

### Trigger

- Case detail;
- Run Summary;
- Suite;
- Issue rerun.

### Steps

1. Выбрать baseline и candidate System Versions/Runs.
2. Для нового execution выбрать exact context.
3. Пройти candidate guided Run.
4. Compare показывает side-by-side:
   - output;
   - context comparability;
   - rubric;
   - criteria scores/delta;
   - comments/issues.
5. Optional AI diff summary.
6. Operator выбирает:
   - Baseline;
   - Candidate;
   - Tie.
7. Сохраняет optional comment.
8. При regression создаёт Issue.

### Important

Score delta не заменяет preference. Изменение `7 → 8` не гарантирует, что
candidate лучше по важному критерию.

## Flow 17 — Capture System Version

### Trigger

System Versions → `Capture current`.

### Steps

1. Ввести label/description.
2. Выбрать role baseline/candidate.
3. Backend показывает captured:
   - code revision;
   - dirty flag;
   - models;
   - prompt identifiers/hashes.
4. Confirm.

### Rule

UI не редактирует captured metadata и не переключает runtime prompts.

## Resume and recovery

### Browser reload

Run ID находится в route. UI повторно получает current server state. Local
draft message/context edit может быть потерян, если не был сохранён; важные
execution data живут на backend.

### Long execution

Если request завершился неизвестно:

- UI запрашивает Run/Step status;
- не отправляет blind duplicate execute;
- предлагает retry только после server status.

### Paused Run

Recent Runs показывает paused guided Runs с `Continue`.

### Stale Profile

Если Profile definition изменён после materialization:

- UI показывает `Sandbox out of date`;
- Run блокируется до rematerialize либо explicit use existing sandbox.

## Success metrics v1

Без отдельной analytics system продукт можно оценить вручную:

- Test Profile создаётся/импортируется за минуты.
- Atomic result доступен без ручного API orchestration.
- Full flow понятно проходит step-by-step.
- Operator видит фактический context.
- Review/comment/Issue не требуют отдельного инструмента.
- Candidate можно сравнить с baseline на том же Case.
- Полезный ad-hoc Run сохраняется как Case одним действием.
