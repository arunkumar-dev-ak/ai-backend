import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response } from 'express';
import { map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const startTime = Date.now();

    const ctx = context.switchToHttp();
    const response: Response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        const processingTime = (Date.now() - startTime) / 1000;

        return {
          status: true,
          message: (data?.message as string) || 'Success',
          statusCode: response.statusCode,
          data: data?.data ?? data,
          processingTime,
          meta: data?.meta || null,
        };
      }),
    );
  }
}
