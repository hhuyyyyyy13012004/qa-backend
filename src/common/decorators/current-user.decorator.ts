import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// @CurrentUser() → lấy user từ request (được gắn bởi JwtStrategy)
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
