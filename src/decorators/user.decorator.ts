import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface JwtUser {
  userId: string;
  email: string;
}

export const Userdetails = createParamDecorator(
  (data: keyof JwtUser, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{
      user: JwtUser;
    }>();
    return data ? request.user?.[data] : request.user;
  },
);
