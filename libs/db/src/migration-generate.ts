import 'dotenv/config';

import { execSync } from 'node:child_process';
import { join } from 'node:path';

const migrationName = process.argv[2];

if (!migrationName) {
  throw new Error('No migration name provided.');
}

const migrationsDir = join(process.cwd(), 'libs/db/src/migrations');

const command = `npm run typeorm migration:generate -- --pretty ${migrationsDir}/${migrationName}`;
execSync(command, { stdio: 'inherit' });
