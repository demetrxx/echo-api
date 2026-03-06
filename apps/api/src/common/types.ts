import { DataSource, EntityManager } from 'typeorm';

export interface UpsertResult<T> {
  entity: T;
  created: boolean;
  updated: boolean;
}

export type DS = DataSource | EntityManager;
