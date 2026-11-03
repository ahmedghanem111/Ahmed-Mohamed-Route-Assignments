import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithUser {
  user?: Record<string, unknown>;
}

export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext): unknown => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (data !== undefined) {
      return user?.[data];
    }

    return user;
  },
);
