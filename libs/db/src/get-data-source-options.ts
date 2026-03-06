import { join } from 'node:path';

import { DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

import * as entities from './entities';

export const getDataSourceOptions = (): DataSourceOptions & SeederOptions => {
  const isTsNode =
    Boolean(process[Symbol.for('ts-node.register.instance')]) ||
    process.env.TS_NODE_DEV === 'true' ||
    process.env.TS_NODE === 'true';

  const migrationsPath = isTsNode
    ? join(process.cwd(), 'libs/db/src/migrations/*.ts')
    : join(process.cwd(), 'dist/libs/db/migrations/*.js');

  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: Object.entries(entities)
      .filter(([k]) => k.endsWith('Entity'))
      .map(([, v]) => v) as any[],
    migrations: [migrationsPath],
    // @ts-expect-error await fix
    tls: process.env.DATABASE_SSL === 'true',

    migrationsRun: process.env.DATABASE_RUN_MIGRATIONS === 'true',
    synchronize: process.env.DATABASE_SYNC === 'true',
    logging: process.env.DATABASE_LOGGING === 'true',
  };
};
