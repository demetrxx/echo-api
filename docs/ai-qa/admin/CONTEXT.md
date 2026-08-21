# Admin context

## Назначение

AI-QA — расширение существующей админки Echo для ручной проверки AI-функций.
Этот пакет документов не выбирает frontend stack и не предполагает создание
отдельного frontend-репозитория. Он описывает идею, UX, state и contract,
которые должны быть встроены в фактическую admin codebase.

Backend namespace и endpoints описаны в
[../be/API_CONTRACT.md](../be/API_CONTRACT.md).

## Проблема оператора

Сейчас разработчик может вызвать отдельные product endpoints, но этого
недостаточно для ответа на вопросы:

- результат плохой из-за seed data, context, prompt или предыдущего шага;
- улучшилась ли новая версия относительно старой;
- одинаково ли система работает для разных creator segments;
- повторяется ли уже найденная проблема;
- что именно увидел AI;
- можно ли воспроизвести удачный/неудачный тест.

При этом отдельная сложная evaluation platform создаст больше maintenance,
чем сам продукт. Поэтому admin UX строится вокруг одного короткого пути:

```text
выбрать Profile
  → запустить Quick Test
  → пройти Steps
  → оценить 1–10
  → повторить/сравнить
  → при необходимости сохранить Case/Issue
```

## Пользователь

v1 рассчитана на одного internal operator:

- он понимает продукт;
- может оценивать writing/strategy quality;
- самостоятельно меняет product code/prompts вне админки;
- не нуждается в assignments, approvals и team analytics.

UX всё равно сохраняет автора review/issue на уровне backend, чтобы не
блокировать будущее расширение, но не показывает team workflow.

## Основные принципы

### Start with action

Домашний экран — launch surface, а не dashboard. Primary CTA:
`Start Quick Test`.

### Ad-hoc first

Для запуска не нужно заранее создавать Case или Suite. Сначала оператор
исследует результат; полезный Run можно сохранить позже.

### Product behavior by default

Smart defaults повторяют реальный product context. UI показывает compact
preview и позволяет override, но не заставляет вручную выбирать все связи
перед каждым запуском.

### Progressive disclosure

Обычный review показывает:

- input summary;
- output;
- AI review;
- human score/comment;
- next action.

Prompt, raw output, resolved IDs, latency и error details открываются по
запросу.

### Guided, not automated

Полный flow идёт по одному шагу. После каждого шага оператор:

- оценивает;
- выбирает output, если нужно;
- retry;
- continue;
- stop.

### Preserve history

Retry/rerun не переписывает старый output. Candidate comparison всегда
показывает, какие exact inputs/context/version были использованы.

### AI assists, human decides

AI:

- создаёт draft Profile;
- объясняет result;
- предлагает scores/comments/issues;
- сравнивает baseline/candidate.

AI не:

- меняет product configuration;
- закрывает Issue;
- переписывает human review;
- запускает дорогие flows без явного действия.

## Information architecture

Минимальная навигация:

```text
AI Tests
├── Home / Quick Test
├── Profiles
├── Runs
├── Tests
│   ├── Cases
│   └── Suites
├── Issues
└── System Versions
```

Compare может быть отдельным route либо action внутри Run/Case/System Version.
Не обязательно добавлять ещё один top-level navigation item.

## Основные объекты в UI

### Profile

Показывается как тестовый пользователь:

- identity;
- goals;
- pillars/themes;
- voice rules/examples;
- notes;
- strategy state;
- history;
- sandbox status.

UI не должен показывать TypeORM rows как основной способ редактирования.

### Quick Test

Ad-hoc test:

- Profile;
- System Version;
- capability или guided flow;
- smart context preview;
- optional overrides.

### Run

Рабочая сессия. Atomic Run содержит один AI Step. Guided Run — несколько
линейных Steps.

### Case

Сохранённое определение Run, которое можно повторить.

### Suite

Упорядоченная группа Cases по segment. Suite run в v1 — ручная очередь.

### Review

AI и human scores от 1 до 10 по одним criteria. Human score имеет приоритет в
effective view, но AI score не скрывается.

### Issue

Короткая проблема:

- title;
- severity;
- status;
- связанный Run/Step;
- optional resolution Run.

## 10-балльная шкала

UI использует integer 1–10. Общие bands:

- 1–3: fail;
- 4–6: weak/mixed;
- 7–8: good;
- 9–10: excellent.

Каждый criterion показывает capability-specific anchors. Число без
объяснения rubric не считается достаточным.

AI score и rationale появляются первым. Operator:

- принимает все;
- меняет overall;
- меняет отдельный criterion;
- добавляет comment.

Если human и AI заметно расходятся, UI может подсветить delta, но не требует
дополнительного workflow.

## Atomic и full flow в одном UX

Не нужны отдельные продукты «unit tests» и «E2E tests».

Одинаковый Runner:

- atomic: один Step → Review → Finish;
- guided: Step → Review/Selection → Continue → следующий Step.

Произвольный flow можно сформировать естественно: начать atomic Step и
выбрать `Continue to ...`, если backend вернул допустимый next action. Часто
используемые последовательности представлены presets.

## Smart defaults

Перед Run:

```text
Context selected by product
- Notes: 3
- Strategy: Active strategy
- Theme: Friction vs features
- Voice: Artem default
- Previous posts: 5
```

Каждый item имеет source:

- product default;
- Case;
- operator override;
- previous Step.

Operator может открыть/Edit Context. Изменения явно помечаются и сохраняются
в Run.

## Два rerun режима

### Reproduce exact

Использовать те же inputs/resolved context. Default для baseline/candidate
comparison.

### Run as product now

Снова применить текущие smart defaults. Используется для проверки
пользовательского поведения после изменения context assembly.

## System Versions

Admin:

- выбирает current/baseline/candidate;
- показывает metadata;
- инициирует capture current version, если разрешено;
- не редактирует prompt/model/runtime settings.

Изменения готовятся в code/deployment. Если старая версия недоступна для
execution, UI показывает historical snapshot, но не обещает rerun.

## Seed Assistant

Profile creation starts from free-form chat:

> «Создай founder-operator с хаотичными notes, сильным английским voice и
> неполной strategy.»

Результат всегда виден как structured Profile draft.

Policy:

- локальные изменения можно применить сразу с Undo;
- массовая генерация/удаление/stress changes сначала показываются как diff;
- AI не materialize sandbox автоматически;
- manual edit остаётся доступным;
- Profile может быть импортирован из JSON без чата.

## Review Assistant

Внутри Run:

- кратко объясняет strengths/weaknesses;
- выставляет rubric scores;
- отвечает на follow-up о result/context;
- сравнивает retry;
- предлагает текст Issue.

Он визуально отделён от тестируемого Strategy chat. Сообщение Review
Assistant не должно случайно стать product user message.

## Намеренно отсутствует

- Home с десятками charts.
- Analytics trends до накопления данных.
- Visual graph/branch browser.
- Скрытая сложная терминология evaluation engineering.
- Prompt editor.
- Team review queue.
- Auto-fail deployment.
- Автоматическое применение AI suggestions к ready Profile.

## Источники

- Shared scope: [../README.md](../README.md).
- User journeys: [USER_FLOWS.md](USER_FLOWS.md).
- Screens: [SCREEN_SPECS.md](SCREEN_SPECS.md).
- State/API: [API_AND_STATE.md](API_AND_STATE.md).
- Product UX principles: `chat/04_USER_FLOWS_AND_SCREENS.md`.
- Synthetic data methodology: `fixtures/raw.md`.
