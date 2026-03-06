import { UserEntity } from '@app/db';
import { type FastifyRequest } from 'fastify';

export type AuthenticatedPersonFastifyRequest = FastifyRequest & {
  token: string;
  user: UserEntity;
};
