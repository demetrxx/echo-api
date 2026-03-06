import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  id: string;
}

export const User = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user as User;
  },
);
