import { BullModule } from '@nestjs/bullmq';
import { DynamicModule } from '@nestjs/common/interfaces';

export type IngestionQueueMessageData = {
  sourceId: string;
  fetchParams: {
    since: Date;
    limit: number;
  };
};

export type IngestionQueueMessageResult = void;

export const INGESTION_QUEUE_NAME = 'ingestion';

export const registerIngestionQueue = (): DynamicModule =>
  BullModule.registerQueue({
    name: INGESTION_QUEUE_NAME,
  });
