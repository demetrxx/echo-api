# Admin QA API contract

## Status

Этот документ описывает целевой contract. Endpoints ещё не реализованы.
Фактический route tree проекта начинается с `/admin`. Если deployment
добавляет внешний `/api` prefix, это инфраструктурная деталь и не меняет
NestJS route definitions.

Base path:

```text
/admin/qa
```

## Общие правила

### Auth

- Все endpoints защищены admin authorization.
- Обычного active user недостаточно.
- `operatorUserId` берётся из auth context, а не request body.
- Sandbox user никогда не используется для авторизации admin requests.

### DTO

- Request validation следует текущему NestJS pattern:
  `class-validator` + global whitelist/transform.
- Unknown fields отбрасываются или приводят к validation error согласно
  принятому project convention.
- Response DTO не должен возвращать TypeORM entity напрямую.

### IDs

- Все persistent IDs — UUID.
- `stepKey` и `capabilityKey` — stable machine-readable strings.

### Error shape

Использовать существующий application exception/filter convention.
Conceptual error:

```json
{
  "error": {
    "code": "QA_CONTEXT_AMBIGUOUS",
    "message": "More than one active strategy is available",
    "details": {
      "strategyIds": ["..."]
    }
  }
}
```

Required QA codes:

- `QA_PROFILE_INVALID`;
- `QA_PROFILE_NOT_READY`;
- `QA_SANDBOX_REQUIRED`;
- `QA_SANDBOX_MISMATCH`;
- `QA_CAPABILITY_UNKNOWN`;
- `QA_CONTEXT_AMBIGUOUS`;
- `QA_CONTEXT_INVALID`;
- `QA_RUN_STATE_INVALID`;
- `QA_STEP_STATE_INVALID`;
- `QA_SYSTEM_VERSION_UNAVAILABLE`;
- `QA_EXECUTION_FAILED`;
- `QA_REVIEW_FAILED`;
- `QA_CLONE_CONFIRMATION_REQUIRED`.

### Pagination

List endpoints следуют существующему shape:

```json
{
  "total": 42,
  "data": [],
  "skip": 0,
  "take": 20
}
```

### Idempotency

v1 manual UI не требует общего idempotency framework, но mutation endpoints
должны защищаться state machine:

- completed Step нельзя выполнить повторно под тем же attempt;
- retry создаёт новый attempt/output;
- materialize не создаёт второго sandbox, если Profile уже ready;
- compare не должен молча запускать новые Runs без explicit `execute: true`.

## Profile API

### `GET /profiles`

Назначение: список Test Profiles.

Query:

- `skip`, `take`;
- optional `segment`;
- optional `source`;
- optional `status`;
- optional text search.

List item:

```json
{
  "id": "uuid",
  "name": "Artem — founder operator",
  "segment": "founder_operator",
  "source": "fixture_import",
  "status": "ready",
  "sandboxUserId": "uuid",
  "counts": {
    "notes": 62,
    "themes": 5,
    "postSamples": 5
  },
  "updatedAt": "ISO-8601"
}
```

### `POST /profiles`

Создать draft.

Supported sources:

```json
{
  "name": "Artem",
  "segment": "founder_operator",
  "source": "fixture_import",
  "fixtureKey": "creator_founder_operator"
}
```

или:

```json
{
  "name": "Custom creator",
  "segment": "custom",
  "source": "ai_generated",
  "brief": "Free-form user description"
}
```

или:

```json
{
  "name": "Clone for regression",
  "segment": "custom",
  "source": "real_clone",
  "sourceUserId": "uuid",
  "cloneOptions": {
    "notesLimit": 50,
    "includePosts": true,
    "includeVoice": true,
    "includeStrategy": true
  }
}
```

Real clone может быть создан как draft, но materialization требует отдельного
confirmation endpoint/body.

### `GET /profiles/:profileId`

Возвращает:

- metadata;
- portable definition;
- materialization state/error;
- sandbox summary;
- recent Runs;
- source metadata без sensitive credentials.

### `PATCH /profiles/:profileId`

Редактировать draft definition.

Ограничения:

- нельзя менять `sourceUserId` ready clone;
- изменение definition после materialization переводит Profile в состояние
  `draft_changed` либо требует явного rematerialize;
- endpoint не меняет sandbox user автоматически.

### `POST /profiles/:profileId/seed-assistant/messages`

AI-assisted profile editing.

Request:

```json
{
  "message": "Add ten realistic noisy notes",
  "selectedPaths": ["notes.noisy"],
  "currentDraftRevision": 4
}
```

Response:

```json
{
  "assistantMessage": "Added ten notes...",
  "changes": [
    {
      "operation": "append",
      "path": "notes.noisy",
      "value": []
    }
  ],
  "scope": "bulk",
  "requiresConfirmation": true,
  "draftRevision": 4
}
```

Policy:

- local safe changes могут быть применены отдельным PATCH сразу;
- backend assistant endpoint сам не должен изменять ready Profile;
- broad changes возвращаются как proposal;
- raw prompt/output можно хранить только согласно PII policy.

### `POST /profiles/:profileId/materialize`

Создать sandbox product state.

Request:

```json
{
  "confirmRealClone": false
}
```

Response:

```json
{
  "profileId": "uuid",
  "status": "materializing"
}
```

Если execution синхронный в первом slice, response может сразу вернуть
`ready`. UI contract должен поддерживать оба состояния.

### `GET /profiles/:profileId/materialization`

```json
{
  "status": "ready",
  "sandboxUserId": "uuid",
  "counts": {
    "notes": 62,
    "themes": 5,
    "strategies": 1,
    "voices": 1,
    "posts": 0
  },
  "error": null
}
```

### `POST /profiles/:profileId/rematerialize`

Явно удалить/архивировать текущий sandbox и создать новый из текущего
definition.

Request требует:

```json
{
  "confirm": true
}
```

## Capability catalog

### `GET /capabilities`

Read-only registry:

```json
{
  "capabilities": [
    {
      "key": "ideas.suggest",
      "label": "Generate ideas",
      "status": "ready",
      "inputSchema": {},
      "defaultRubric": [],
      "allowedNext": ["post.create"]
    }
  ],
  "flows": [
    {
      "key": "notes_to_idea_to_post",
      "label": "Notes → Idea → Post",
      "steps": ["ideas.suggest", "post.create", "post.refine"]
    }
  ]
}
```

Frontend не hardcode'ит capability availability, но может иметь
capability-specific renderer для известных keys.

## Context preview

### `POST /context/preview`

Request:

```json
{
  "profileId": "uuid",
  "capabilityKey": "ideas.suggest",
  "input": {
    "amount": 5,
    "noteIds": ["uuid"]
  },
  "caseId": null,
  "overrides": {}
}
```

Response:

```json
{
  "profileId": "uuid",
  "sandboxUserId": "uuid",
  "capabilityKey": "ideas.suggest",
  "input": {
    "amount": 5
  },
  "context": [
    {
      "key": "notes",
      "source": "operator_override",
      "ids": ["uuid"],
      "summary": "1 selected note"
    },
    {
      "key": "strategy",
      "source": "product_default",
      "ids": ["uuid"],
      "summary": "Active strategy"
    }
  ],
  "warnings": [],
  "contextHash": "stable-hash"
}
```

Preview response можно передать в create Run. Backend обязан проверить, что
hash всё ещё валиден, либо явно повторно разрешить context.

## Run API

### `POST /runs`

Создать ad-hoc или Case-backed Run.

Atomic:

```json
{
  "profileId": "uuid",
  "systemVersionId": "uuid",
  "kind": "atomic",
  "capabilityKey": "ideas.suggest",
  "input": {},
  "contextPreview": {},
  "caseId": null
}
```

Guided:

```json
{
  "profileId": "uuid",
  "systemVersionId": "uuid",
  "kind": "guided",
  "flowKey": "notes_to_idea_to_post",
  "initialInput": {},
  "caseId": null
}
```

Response:

```json
{
  "id": "uuid",
  "status": "ready",
  "currentStepKey": "ideas",
  "steps": []
}
```

### `GET /runs`

Filters:

- profile;
- case/suite;
- system version;
- capability/flow;
- status;
- date.

### `GET /runs/:runId`

Full Run detail:

- snapshots;
- resolved context;
- steps;
- reviews;
- issues;
- source/comparison relations.

### `POST /runs/:runId/steps/current/execute`

Выполнить current pending step.

Request:

```json
{
  "inputOverrides": {},
  "contextHash": "hash",
  "clientRequestId": "optional-uuid"
}
```

Response:

```json
{
  "runId": "uuid",
  "runStatus": "paused",
  "step": {
    "key": "ideas",
    "status": "completed",
    "input": {},
    "resolvedContext": {},
    "output": {},
    "artifacts": {},
    "durationMs": 1200
  },
  "nextActions": ["review", "select_output", "retry", "continue", "finish"]
}
```

### `POST /runs/:runId/steps/current/retry`

Создаёт новый attempt текущего Step и сохраняет предыдущий attempt.

### `POST /runs/:runId/steps/current/select`

Request:

```json
{
  "selection": {
    "type": "idea",
    "id": "uuid"
  }
}
```

Selection валидируется: artifact должен принадлежать current Run/sandbox.

### `POST /runs/:runId/continue`

Подготавливает следующий guided Step. Не выполняет его молча, если основной
режим guided.

### `POST /runs/:runId/steps/current/skip`

Только для optional steps.

### `POST /runs/:runId/complete`

Завершить Run полностью или partial.

```json
{
  "reason": "completed_flow"
}
```

### `POST /runs/:runId/cancel`

Не удаляет выполненные artifacts; помечает Run cancelled.

### `POST /runs/:runId/rerun`

Request:

```json
{
  "systemVersionId": "candidate-uuid",
  "contextPolicy": "exact",
  "fromStepKey": null
}
```

Создаёт новый Run. `fromStepKey` поддерживается только если backend умеет
безопасно восстановить pre-step sandbox state. До реализации этого contract
UI предлагает полный rerun, а не имитирует частичное восстановление.

## Review API

### `POST /runs/:runId/reviews/ai`

Optional `stepKey`.

AI review не принимает произвольную rubric от клиента; использует Run
snapshot.

### `PUT /runs/:runId/reviews/human`

Request:

```json
{
  "stepKey": "ideas",
  "overallScore": 6,
  "criteria": [
    {
      "key": "grounding",
      "score": 4,
      "comment": "The theme matches but the observation is missing"
    }
  ],
  "comment": "Useful direction, too generic."
}
```

Human review можно обновлять; audit timestamps сохраняются.

## Issue API

### `GET /issues`

Filters:

- status;
- severity;
- capability;
- segment;
- Run/Case/Suite.

### `POST /issues`

```json
{
  "runId": "uuid",
  "stepKey": "ideas",
  "title": "Selected note was ignored",
  "description": "The output only reused the broad theme.",
  "severity": "major"
}
```

### `PATCH /issues/:issueId`

Поддерживает:

- title/description/severity;
- `status`;
- `resolutionRunId`.

При `fixed` рекомендуется требовать `resolutionRunId`, но разрешить manual
override для solo v1.

## Cases

### `GET /cases`

Filters:

- segment;
- kind;
- capability/flow;
- suite;
- status.

### `POST /cases`

Создать вручную или из Run:

```json
{
  "name": "Founder — noisy notes to ideas",
  "createdFromRunId": "uuid",
  "segment": "founder_operator"
}
```

Backend извлекает definition/snapshots, но не копирует output как golden.

### `GET /cases/:caseId`

Возвращает definition, rubric, profile summary, recent Runs и open Issues.

### `PATCH /cases/:caseId`

Изменение definition влияет только на будущие Runs.

### `POST /cases/:caseId/run`

Shortcut над `POST /runs`.

## Suites

### `GET /suites`

### `POST /suites`

```json
{
  "name": "Founder core",
  "segment": "founder_operator",
  "caseIds": ["uuid"],
  "baselineSystemVersionId": "uuid"
}
```

### `GET /suites/:suiteId`

Включает ordered Cases, latest Runs и open Issues.

### `PATCH /suites/:suiteId`

Поддерживает reorder `caseIds`.

### `POST /suites/:suiteId/run`

Создаёт manual suite session либо возвращает first Case to run. v1 не
выполняет cases в background.

## System Versions

### `GET /system-versions`

Показывает available, baseline, candidate и archived snapshots.

### `POST /system-versions/capture`

```json
{
  "label": "candidate-post-context-v2",
  "description": "Pass voice through PostService.refine",
  "role": "candidate"
}
```

Backend capture собирает metadata из текущего runtime. Endpoint не меняет
model/prompt.

### `PATCH /system-versions/:id`

Меняет label/description/role, но не snapshot.

## Compare

### `POST /compare`

Сравнить существующие Runs:

```json
{
  "baselineRunId": "uuid",
  "candidateRunId": "uuid"
}
```

Response:

```json
{
  "contextComparable": true,
  "rubricComparable": true,
  "warnings": [],
  "steps": [],
  "scores": {
    "baseline": {},
    "candidate": {},
    "delta": {}
  },
  "humanPreference": null,
  "aiSummary": null
}
```

### `POST /compare/review`

```json
{
  "baselineRunId": "uuid",
  "candidateRunId": "uuid",
  "preference": "candidate",
  "comment": "Grounding improved; voice became slightly flatter."
}
```

AI diff summary может быть отдельным endpoint/action, чтобы compare page не
создавала LLM cost без запроса.

## Contract ownership

- Backend владеет DTO validation, state machine, capability registry и
  security invariants.
- Admin владеет presentation, local draft state и explicit operator actions.
- Admin не вычисляет product defaults самостоятельно.
- Admin не определяет доступные transitions hardcoded, если backend вернул
  `nextActions`.
- Capability-specific UI может улучшать renderer, но обязано сохранять
  generic fallback для новых keys.

## Изменение contract

При реализации endpoint:

1. уточнить DTO по фактической entity/schema;
2. обновить этот документ;
3. обновить Swagger/OpenAPI decorators;
4. обновить зависимые `AIQA-ADM-*` tasks;
5. не менять semantics только ради удобства одного screen без проверки guided
   flow.
