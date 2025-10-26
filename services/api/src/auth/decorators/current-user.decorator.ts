/**
 * CurrentUser decorator for getting authenticated user from request
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { OktaUser } from '@random-truffle/auth';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): OktaUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
