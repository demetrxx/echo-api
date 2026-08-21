import { UserEntity } from '@app/db';
import { DataSource, EntityManager } from 'typeorm';

import { AppError } from '@/common/errors/app-error';

export async function assertSandboxUser(
  ds: DataSource | EntityManager,
  userId: string,
): Promise<UserEntity> {
  const user = await ds.getRepository(UserEntity).findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('QA_SANDBOX_REQUIRED', 'Sandbox user was not found');
  }

  if (!user.isQaSandbox) {
    throw new AppError(
      'QA_SANDBOX_REQUIRED',
      'Executor only accepts QA sandbox users',
      { userId },
    );
  }

  return user;
}
