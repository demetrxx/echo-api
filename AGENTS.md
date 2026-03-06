# Repository Guidelines

## Project Structure & Module Organization
- `apps/api/` holds the NestJS application (entrypoint in `apps/api/src/`).
- `libs/` contains shared libraries such as database and queue modules (`libs/db/`, `libs/queue/`, `libs/convo-handler/`).
- `apps/api/test/` contains e2e tests and Jest config.
- `docs/` holds product and conversation notes (see `docs/conversation.md`).

## Build, Test, and Development Commands
- `pnpm install` installs dependencies.
- `pnpm start:dev` runs the API in watch mode (local development).
- `pnpm build` compiles the NestJS app to `dist/`.
- `pnpm test` runs unit tests with Jest.
- `pnpm test:e2e` runs end-to-end tests from `apps/api/test/jest-e2e.json`.
- `pnpm lint` runs ESLint with auto-fixes.
- `pnpm format` formats TypeScript via Prettier.
- `docker compose up` starts Redis, Postgres (pgvector), and MinIO locally.

## Coding Style & Naming Conventions
- Language: TypeScript (NestJS).
- Formatting: Prettier (`pnpm format`).
- Linting: ESLint with TypeScript rules (`pnpm lint`).
- Naming: use clear, domain-driven terms from `instructions.md` (e.g., `Source`, `Document`, `Chunk`, `Theme`, `Post`).
- Prefer explicit, descriptive module names under `libs/` (e.g., `db`, `queue`).

## Testing Guidelines
- No testing for now

## Commit & Pull Request Guidelines
- Commit messages follow a Conventional Commits style (e.g., `feat(codex): add instructions`).
- PRs should include: summary of changes, how to test, and any relevant screenshots or logs.
- Link issues or tasks when applicable.

## Product & Domain Rules
- Follow canonical domain language and rules in `instructions.md` (Signals → Themes → Posts; PostContext is required).
- Keep ingestion and retrieval behavior deterministic and explainable.

## Configuration Tips
- Use `.env` for secrets and local configuration; `APP_URL` is set via `ngrok.sh` in dev.
