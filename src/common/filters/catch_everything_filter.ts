import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor() {}

  private readonly logger = new Logger(CatchEverythingFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp(); // Extract HTTP context from the generic host
    const res = ctx.getResponse<Response>(); // Get the HTTP response object

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: unknown = 'An unexpected error occurred';
    let errors: unknown = null;

    if (exception instanceof BadRequestException) {
      statusCode = HttpStatus.BAD_REQUEST;
      const response = exception.getResponse();

      if (typeof response === 'object') {
        message = 'message' in response ? response.message : 'Bad request';
        errors = 'errors' in response ? response.errors : null;
      } else {
        message = 'Bad request';
      }
    } else if (exception instanceof UnauthorizedException) {
      statusCode = HttpStatus.UNAUTHORIZED;
      message = exception.message || 'An error occurred';
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = exception.message || 'An error occurred';
    }

    this.logger.error(
      message,
      exception instanceof Error ? exception.stack : '',
    );

    res.status(statusCode).json({
      success: false,
      message: message,
      statusCode: statusCode,
      errors,
    });
  }
}
