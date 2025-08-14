import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data === 'id') {
      return user?.userId || user?.id;
    }

    return data ? user?.[data] : user;
  },
); 