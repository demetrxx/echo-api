export type AppErrorCode =
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'CONFLICT'
  | 'VALIDATION'
  | 'FORBIDDEN'
  | 'UNAUTHORIZED'
  | 'INTERNAL';

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly details?: unknown,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const Err = {
  notFound: (msg = 'Not found', details?: unknown) =>
    new AppError('NOT_FOUND', msg, details),
  conflict: (msg = 'Conflict', details?: unknown) =>
    new AppError('CONFLICT', msg, details),
  badRequest: (msg = 'Bad request', details?: unknown) =>
    new AppError('BAD_REQUEST', msg, details),
  validation: (msg = 'Validation failed', details?: unknown) =>
    new AppError('VALIDATION', msg, details),
  forbidden: (msg = 'Forbidden', details?: unknown) =>
    new AppError('FORBIDDEN', msg, details),
  unauthorized: (msg = 'Unauthorized', details?: unknown) =>
    new AppError('UNAUTHORIZED', msg, details),
  internal: (msg = 'Internal error', details?: unknown, cause?: unknown) =>
    new AppError('INTERNAL', msg, details, cause),
};
