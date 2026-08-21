# Backend context

## Назначение документа

Этот файл описывает фактическое состояние backend на момент проектирования
AI-QA. Он нужен implementer, чтобы не создавать параллельный product stack и
не принимать старые product-документы за уже реализованный runtime.

Целевая архитектура описана в [ARCHITECTURE.md](ARCHITECTURE.md), API — в
[API_CONTRACT.md](API_CONTRACT.md), задачи — в
[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

## Repository и runtime

- Backend: NestJS + Fastify.
- Persistence: TypeORM + PostgreSQL.
- Shared DB code: `libs/db/`.
- Product modules: `apps/api/src/modules/`.
- HTTP surfaces:
  - app API;
  - admin API;
  - auth API;
  - internal API.
- API trees регистрируются в `apps/api/src/api/api.module.ts`.
- Swagger настраивается в `apps/api/src/main.ts`.
- Глобального `/api` prefix в `main.ts` нет. В исходном коде admin route
  начинается с `/admin`; внешний reverse proxy может добавлять собственный
  prefix.

## Текущая admin-поверхность

`apps/api/src/api/admin/admin-api.routes.ts` регистрирует:

```text
/admin
└── /users
```

Фактические ограничения:

- users controller является scaffold и не предоставляет рабочий набор
  операций;
- WIP-файлы в `apps/api/src/api/admin/themes/` скопированы из users и ещё не
  образуют theme API;
- `ThemeAdminService` существует, но не подключён как законченный admin flow;
- admin roles/permissions в `UserEntity` отсутствуют;
- текущий `@Protected()` проверяет обычного активного пользователя, а не роль
  администратора.

AI-QA должен расширять этот API namespace, а не создавать отдельный
параллельный HTTP application.

Рекомендуемый source path:

```text
apps/api/src/api/admin/qa/
apps/api/src/modules/qa/
```

Фактический public path должен следовать router tree проекта
(`/admin/qa/*` до внешних proxy prefixes).

## Auth

Текущий `AuthGuard`:

- принимает Bearer JWT access token;
- в dev-режиме при включённом email auth может использовать email как bearer;
- загружает `UserEntity` со статусом `active`;
- не различает app user и admin operator.

Для AI-QA нельзя считать обычный `@Protected()` достаточным production
admin authorization. Минимальный v1 guard определяется отдельной foundation
задачей. Допустимый первый вариант для solo operator — explicit allowlist
администраторских user IDs/emails в конфигурации. Полноценный RBAC находится
за пределами AI-QA v1, но endpoint не должен оставаться доступным любому
авторизованному user.

## Product entities

Фактическая schema находится в `libs/db/src/entities/`.

### User

`UserEntity` владеет:

- themes;
- notes;
- posts;
- voices;
- strategies;
- ideas;
- auth sessions и Telegram relation.

Почти все domain queries ограничиваются `userId`. Это позволяет использовать
отдельного sandbox user как границу QA-данных и переиспользовать существующие
services.

Сейчас `UserEntity` не содержит признака QA/sandbox. Без такого признака
materializer может случайно принять production user за тестового, поэтому
архитектура предусматривает явный safety marker.

### Notes

Основные файлы:

- `libs/db/src/entities/note.entity.ts`;
- `apps/api/src/modules/note/note.service.ts`;
- `apps/api/src/api/app/notes/`.

Note — compiled text с underlying items. Text notes подходят как основной
seed material. Voice/file/link capture требует дополнительные assets и не
должен блокировать первый vertical slice.

Особенность: title generation может выполняться асинхронно. QA step не должен
считать auto-title завершённым сразу после create без отдельного ожидания.

### Themes

Основные файлы:

- `libs/db/src/entities/theme.entity.ts`;
- `libs/db/src/entities/note-theme.entity.ts`;
- `apps/api/src/modules/theme/`.

Theme CRUD реализован. `ThemeSuggestService` содержит незавершённую
LLM-логику и не является готовой v1 capability.

### Strategy

Основные файлы:

- `libs/db/src/entities/strategy.entity.ts`;
- `libs/db/src/entities/strategy-conversation.entity.ts`;
- `apps/api/src/modules/strategy/strategy.service.ts`;
- `apps/api/src/modules/strategy/strategy.agent.ts`;
- `apps/api/src/modules/strategy/prompts/`;
- `apps/api/src/modules/strategy/consts/`.

Strategy — stateful multi-turn agent:

- conversation history хранится отдельно;
- structured snapshot является source of truth;
- agent вызывает tools и меняет themes/voice/snapshot;
- доступные tools зависят от stage.

Это наиболее сложная capability для QA. Один atomic step соответствует одному
user message и полному agent turn, а guided flow — нескольким messages.

Известные риски текущей реализации:

- agent behavior nondeterministic;
- tool side effects важнее одного final text;
- отдельные fire-and-forget операции могут завершиться после response;
- prompt/context logging не является structured tracing.

### Ideas

Основные файлы:

- `libs/db/src/entities/idea.entity.ts`;
- `apps/api/src/modules/idea/idea.service.ts`;
- `apps/api/src/modules/idea/idea-generator.service.ts`;
- `apps/api/src/modules/idea/idea-generation.prompt.ts`.

Idea generation собирает context из optional theme, selected notes, active
strategy и voice. Structured output парсится из LLM JSON.

Для QA особенно важно фиксировать:

- какие note IDs были запрошены;
- какой strategy/voice фактически разрешился;
- raw response и parse error;
- созданные idea IDs.

### Posts

Основные файлы:

- `libs/db/src/entities/post.entity.ts`;
- `libs/db/src/entities/post-version.entity.ts`;
- `apps/api/src/modules/post/post.service.ts`;
- `apps/api/src/modules/post/post-refine.service.ts`;
- `apps/api/src/modules/post/prompts/refine.prompt.ts`.

Post create создаёт product state, а Post refine вызывает LLM и сохраняет
новую `PostVersion`. Version chain уже даёт полезную product-level историю,
но не заменяет QA Run: она не хранит rubric, system version и profile snapshot.

### Voice

Основные файлы:

- `libs/db/src/entities/voice.entity.ts`;
- `libs/db/src/entities/voice-example.entity.ts`;
- `libs/db/src/entities/voice-calibration.entity.ts`;
- `apps/api/src/modules/voice/voice.service.ts`;
- `apps/api/src/modules/voice/voice-calibration.service.ts`.

Voice examples используют embeddings. Materialization большого количества
profiles может вызывать внешние embedding calls и стоимость.

Voice calibration — уже существующий multi-step pattern:

```text
examples
  → derive voice profile
  → generate samples
  → human feedback
  → recalibrate
```

Его можно тестировать через QA runner, но нельзя переиспользовать
`VoiceCalibrationEntity` как универсальную QA schema: она привязана к одной
product capability.

## LLM layer

`apps/api/src/modules/llm/llm.service.ts` в текущем виде предоставляет:

- main chat client, model `gpt-5.5`;
- fast chat client, model `gpt-5-mini`;
- embeddings client с model из config;
- transcription model `gpt-4o-mini-transcribe`.

Ограничения для AI-QA:

- model names частично hardcoded;
- нет единого invocation record;
- нет prompt version registry;
- нет token/cost accounting;
- нет общего retry policy;
- prompts собираются в разных services;
- некоторые outputs plain text, некоторые JSON + Zod.

AI-QA v1 не должен начинаться с глобального рефакторинга `LlmService`.
Runner фиксирует доступную metadata вокруг capability execution. Более
глубокий tracing добавляется только там, где без него невозможно объяснить
результат.

## Fixtures

Существующие assets:

- `fixtures/creator_founder_operator.json`;
- `fixtures/creator_expert_educator.json`;
- `fixtures/creator_reflective_writer.json`;
- `fixtures/raw.md`.

JSON содержит:

- profile;
- goals;
- pillars;
- tone rules;
- strategy state;
- raw и noisy notes;
- post samples;
- expected tasks.

Они не загружаются текущим application code. Старый seeder в
`libs/db/src/seeds/characters.seed.ts` не относится к текущему Echo domain и
не должен использоваться как основа.

Рекомендация:

- импортировать fixture в `QaProfile.definition`;
- materializer переводит definition в обычные product entities;
- `expected_tasks` использовать как идеи для Cases, а не как обязательную
  часть materialization.

## Тестовая инфраструктура

- Jest настроен, но domain unit tests отсутствуют.
- Текущий e2e test является boilerplate и не отражает product API.
- `AGENTS.md` фиксирует: «No testing for now».

Это означает, что AI-QA v1 является ручным внутренним инструментом, а не CI
initiative. Backend tasks всё равно должны иметь build/lint/manual
verification, но не обязаны одновременно вводить полный automated test
framework.

## Что переиспользовать

- существующие domain services вместо повторной реализации product logic;
- обычные entities под sandbox user;
- admin router tree;
- DTO/OpenAPI conventions из app API;
- fixtures как исходные profile definitions;
- Strategy snapshots и conversation history как artifacts;
- Post versions как product output history;
- Voice calibration как reference для human feedback loop.

## Что не переиспользовать напрямую

- закомментированные admin users controllers как рабочую бизнес-логику;
- WIP admin themes copies;
- старый `characters.seed.ts`;
- `VoiceCalibrationEntity` как общий Run;
- raw application logs как QA trace;
- real user rows как mutable test state.

## Факт и proposal

В этом документе разделы о существующих files/services — факты. Следующие
понятия являются proposal и ещё не реализованы:

- `QaProfile`;
- sandbox marker;
- capability registry;
- `QaRun`;
- `QaReview`;
- `QaIssue`;
- `QaSystemVersion`;
- `/admin/qa/*`.
