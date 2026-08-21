# Echo AI-QA

## Зачем существует этот пакет документов

Echo уже содержит несколько AI-функций, но качество их работы трудно
наблюдать системно. Результат зависит не только от prompt или model, но и от
пользовательского контекста, выбранных заметок, strategy, voice, предыдущих
шагов и ручных решений между ними.

AI-QA — это внутреннее расширение существующей админки, которое должно
позволить одному оператору:

1. быстро создать реалистичного тестового пользователя;
2. проверить одну AI-функцию отдельно;
3. пройти несколько функций как единый пользовательский flow;
4. увидеть фактический context и результат каждого шага;
5. получить предварительный AI-review;
6. поставить собственную оценку от 1 до 10 и оставить комментарий;
7. зафиксировать проблему;
8. повторить тот же test на baseline и candidate версиях системы;
9. сохранить полезный сценарий в case и suite конкретного сегмента.

Это не отдельная enterprise evaluation platform. Главная цель — дать
максимум практической пользы при минимальной стоимости реализации и
поддержки.

## Зафиксированный ежедневный путь

```text
Test Profile
  → Quick Test
  → Atomic capability или Guided flow
  → Context preview
  → Step-by-step execution
  → AI review + Human review 1–10
  → Comment / Issue
  → Candidate rerun
  → Baseline comparison
  → Save as Case / Add to Suite
```

Создание Case или Suite не является обязательным первым шагом. Оператор
может начать с ad-hoc Quick Test, а сохранить сценарий только после того, как
он оказался полезным.

## Принятые решения

### Scope v1

- Система расширяет существующую admin-поверхность и admin API.
- Рабочий режим — solo-first и manual-first.
- Поддерживаются synthetic profiles и изолированные clones реальных
  пользователей.
- Test может состоять из одной capability или линейной последовательности
  шагов.
- Полный flow выполняется в guided-режиме: оператор видит результат каждого
  шага и выбирает, как продолжать.
- Используется реальный product context assembly. Перед запуском показывается
  compact context preview, который можно переопределить.
- AI-review и human-review хранятся отдельно.
- Все quality criteria оцениваются по шкале 1–10.
- Baseline и candidate выбираются из System Versions. Сами prompts, models и
  runtime settings изменяются в коде, а не в AI-QA UI.
- Старый Run хранит snapshots использованных входов, rubric и system
  metadata, чтобы оставаться понятным после изменений.

### Данные для тестирования

- Synthetic profiles создаются через свободный AI-чат, импорт готового
  fixture или ручное редактирование.
- Существующие `fixtures/creator_*.json` — стартовая библиотека, а не
  финальная schema.
- Real user никогда не используется как mutable QA workspace. Сначала
  создаётся sandbox clone.
- Все продуктовые mutations во время теста выполняются только от имени
  sandbox user.
- При сравнении baseline/candidate по умолчанию повторно используется exact
  resolved context. Для проверки текущего product behavior можно отдельно
  выбрать повторное разрешение smart defaults.

### Оценка

- AI первым выставляет score и коротко объясняет его.
- Оператор может принять или изменить каждый score.
- В effective result используется human score, если он задан; иначе AI score.
- Общий score может быть простым средним для навигации, но отдельные criteria
  всегда остаются видимыми.
- Низкая оценка не создаёт issue автоматически. Оператор явно нажимает
  `Mark issue`.
- В сравнении версий кроме чисел фиксируется предпочтение
  `Baseline / Candidate / Tie`.

## Намеренно не входит в v1

- CI/CD quality gates и headless runner.
- Scheduled или автоматические suite runs.
- Visual flow builder и произвольные DAG.
- Деревья branches и сложная модель checkpoints в UI.
- Hidden-truth framework и отдельное versioning annotations.
- Judge training, inter-rater calibration и сложная статистика.
- Автоматическое изменение prompts/models из админки.
- Полноценный issue tracker с assignees, sprints и workflow approvals.
- Team dashboards, analytics-heavy home и trend forecasting.
- Поддержка незавершённых product capabilities только ради полноты списка.
- Изменение product behavior в рамках задач AI-QA без отдельного решения.

Если будущая потребность требует одного из этих пунктов, она должна быть
подтверждена реальным использованием v1, а не добавлена заранее.

## Основные понятия

### Test Profile

Описание тестового пользователя и связь с его sandbox user. Содержит persona,
goals, pillars, tone rules, strategy state, notes, post samples и другие
данные, необходимые для materialization.

Profile может быть:

- `ai_generated`;
- `fixture_import`;
- `real_clone`.

### Sandbox User

Обычный `UserEntity`, специально созданный для QA. Его Notes, Themes,
Strategies, Ideas, Posts и Voices хранятся в существующих product tables, что
позволяет запускать реальные domain services без отдельной копии продуктовой
модели.

### Capability

Одна вызываемая функция продукта. Примеры:

- один turn Strategy Agent;
- Idea generation;
- Post refine;
- Voice calibration step.

Capability registry задаётся backend-кодом, а не редактируется в БД.

### Guided Flow

Линейная последовательность capabilities. После каждого шага оператор видит
output, может повторить шаг, выбрать один из результатов, изменить разрешённый
input или продолжить.

### Run

Одна фактическая сессия тестирования. Run хранит:

- profile и его snapshot;
- system version и её snapshot;
- resolved context;
- шаги, inputs, outputs, errors и duration;
- AI и human reviews;
- комментарии и связанные issues.

### Test Case

Сохранённое определение полезного Run: начальный profile, последовательность
шагов, входные selections, context overrides и rubric. Case позволяет
повторить сценарий, но не содержит старый output как обязательный golden text.

### Suite

Упорядоченная группа Cases, обычно принадлежащая одному segment. Suite может
содержать и atomic cases, и один или несколько end-to-end flows.

### Review

Оценка Run или отдельного Step. AI и human reviews существуют независимо и
используют одинаковую rubric.

### Issue

Простая запись о проблеме, привязанная к конкретному Run и при необходимости
к Step. Минимальные состояния: `open`, `fixed`, `ignored`.

### System Version

Именованный snapshot текущей реализации: code revision, model names, prompt
hashes/identifiers и важные runtime settings. System Version не переключает
код сама; она описывает доступную backend-конфигурацию для запуска и
сравнения.

## Шкала 1–10

Каждый criterion содержит не только название, но и короткие anchors. Общая
интерпретация:

- `1–3` — явный провал;
- `4–6` — слабый или смешанный результат;
- `7–8` — хороший результат;
- `9–10` — очень сильный результат.

Пример anchors для `Grounding`:

- `2`: output почти не использует выбранный source material;
- `5`: общая тема совпадает, но конкретное наблюдение потеряно;
- `8`: output явно и корректно развивает исходную мысль;
- `10`: мысль развита точно и глубоко без неподдержанных добавлений.

Anchors должны быть capability-specific. Нельзя механически переносить
`Grounding` на Strategy state mutation или `Voice fidelity` на transcription.

## Текущий продуктовый flow

Реально реализованный центр продукта:

```text
Notes / Telegram capture
  → Strategy / Themes / Voice
  → Ideas
  → Post create / refine
```

Документы также описывают будущую модель
`Signals → Documents/Chunks → Themes → Posts`, но ingestion/retrieval pipeline
ещё не реализован как рабочий runtime. Он не входит в AI-QA v1.

Подробная карта backend находится в
[be/CONTEXT.md](be/CONTEXT.md), а capability status — в
[be/CAPABILITIES_AND_FLOWS.md](be/CAPABILITIES_AND_FLOWS.md).

## Структура документации

### Backend

- [be/CONTEXT.md](be/CONTEXT.md) — факты о текущем backend.
- [be/ARCHITECTURE.md](be/ARCHITECTURE.md) — предлагаемая минимальная
  архитектура AI-QA.
- [be/CAPABILITIES_AND_FLOWS.md](be/CAPABILITIES_AND_FLOWS.md) — atomic
  capabilities, guided flows и smart context.
- [be/API_CONTRACT.md](be/API_CONTRACT.md) — концептуальный `/admin/qa/*`
  contract.
- [be/IMPLEMENTATION_PLAN.md](be/IMPLEMENTATION_PLAN.md) — исполнимые
  backend-задачи.

### Admin

- [admin/CONTEXT.md](admin/CONTEXT.md) — роль AI-QA в админке и UX-принципы.
- [admin/USER_FLOWS.md](admin/USER_FLOWS.md) — пользовательские пути.
- [admin/SCREEN_SPECS.md](admin/SCREEN_SPECS.md) — спецификация экранов и
  состояний.
- [admin/API_AND_STATE.md](admin/API_AND_STATE.md) — view models, state
  transitions и API mapping.
- [admin/IMPLEMENTATION_PLAN.md](admin/IMPLEMENTATION_PLAN.md) — исполнимые
  admin-задачи без привязки к frontend stack.

## Фазы

1. Foundation и contracts.
2. Profiles, fixture import и sandbox materialization.
3. Atomic Quick Test и smart context preview.
4. Guided composite flows.
5. AI/human review 1–10 и simple issues.
6. Saved Cases и Suites по сегментам.
7. System Versions, exact-context rerun и baseline/candidate compare.
8. Real-user clone, safety и polish.

Backend и admin plans используют одинаковую нумерацию фаз. Задачи имеют
стабильные IDs:

- `AIQA-BE-xxx` — backend;
- `AIQA-ADM-xxx` — admin.

## Как передать одну задачу другому AI

В prompt достаточно указать:

1. repository root;
2. task ID;
3. требование сначала прочитать этот README;
4. путь к соответствующему `IMPLEMENTATION_PLAN.md`;
5. запрет выходить за `Out of scope`.

Пример:

```text
Репозиторий: /path/to/echo.
Выполни AIQA-BE-203 из docs/ai-qa/be/IMPLEMENTATION_PLAN.md.
Сначала прочитай docs/ai-qa/README.md и все документы, перечисленные
в разделе Context/References задачи. Не выполняй соседние tasks.
```

Каждая задача обязана содержать:

- Goal;
- Why/Context;
- Dependencies;
- Files to inspect/change;
- Steps;
- Acceptance criteria;
- Verification;
- Out of scope.

Если task противоречит текущему коду или принятому решению, агент должен
остановиться и зафиксировать расхождение, а не молча менять scope.

## Source of truth

При конфликте использовать следующий приоритет:

1. текущий запрос пользователя и явные последующие решения;
2. этот README для AI-QA scope и non-goals;
3. `be/API_CONTRACT.md` для границы backend/admin;
4. side-specific architecture и implementation plan;
5. product docs в `chat/`;
6. предположения implementer.

Текущий runtime и schema всегда проверяются по коду. Документация не должна
выдаваться за уже реализованную функциональность.

## Связанные источники репозитория

- `AGENTS.md` — repository conventions.
- `chat/01_PRODUCT_THESIS.md` — product thesis и quality principles.
- `chat/02_DOMAIN_MODEL.md` — domain language.
- `chat/03_STRATEGY_MODULE.md` — Strategy behavior.
- `chat/04_USER_FLOWS_AND_SCREENS.md` — product UX boundaries.
- `chat/05_DECISIONS_AND_OPEN_QUESTIONS.md` — locked/open product decisions.
- `fixtures/raw.md` — test-pack methodology.
- `fixtures/creator_*.json` — существующие synthetic creator packs.
- `apps/api/src/api/admin/` — существующая admin API surface.
- `apps/api/src/modules/` — product services, которые должен переиспользовать
  QA runner.
- `libs/db/src/entities/` — фактическая schema.
