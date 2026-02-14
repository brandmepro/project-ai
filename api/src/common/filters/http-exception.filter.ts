import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.name;
        details = (exceptionResponse as any).details || null;
      } else {
        message = exceptionResponse || exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name || 'Error';
      
      // Log the full stack trace for debugging
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );
    } else {
      message = 'An unexpected error occurred';
      this.logger.error('Unknown exception type', exception);
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message: Array.isArray(message) ? message : [message],
      ...(details && { details }),
    };

    // Log error details
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`,
    );

    response.status(status).json(errorResponse);
  }
}
