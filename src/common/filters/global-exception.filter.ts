import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,  
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError, TypeORMError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();
    const path = req.originalUrl || req.url;
    const method = req.method;

    // 1) Handle DTO validation errors
    if (exception instanceof BadRequestException) {
      const response: any = exception.getResponse();
      const messages = response?.message;
      const errors = this.normalizeValidationErrors(messages);

      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: 'Validation failed',
        errors,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        timestamp,
        path,
        method,
      });
    }

    // 2) Handle specific HTTP exceptions with better messages
    if (exception instanceof UnauthorizedException) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required',
        error: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED,
        timestamp,
        path,
        method,
      });
    }

    if (exception instanceof ForbiddenException) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: 'Access denied',
        error: 'Forbidden',
        statusCode: HttpStatus.FORBIDDEN,
        timestamp,
        path,
        method,
      });
    }

    if (exception instanceof NotFoundException) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Resource not found',
        error: 'Not Found',
        statusCode: HttpStatus.NOT_FOUND,
        timestamp,
        path,
        method,
      });
    }

    if (exception instanceof ConflictException) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: 'Resource conflict',
        error: 'Conflict',
        statusCode: HttpStatus.CONFLICT,
        timestamp,
        path,
        method,
      });
    }

    if (exception instanceof PayloadTooLargeException) {
      return res.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
        success: false,
        message: 'Request payload too large',
        error: 'Payload Too Large',
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        timestamp,
        path,
        method,
      });
    }

    if (exception instanceof UnsupportedMediaTypeException) {
      return res.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).json({
        success: false,
        message: 'Unsupported media type',
        error: 'Unsupported Media Type',
        statusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        timestamp,
        path,
        method,
      });
    }

    // 3) Handle TypeORM errors
    if (exception instanceof QueryFailedError) {
      const error = exception as any;

      // Handle unique constraint violations
      if (error.code === '23505') { // PostgreSQL unique violation
        return res.status(HttpStatus.CONFLICT).json({
          success: false,
          message: 'Resource already exists',
          error: 'Duplicate Entry',
          statusCode: HttpStatus.CONFLICT,
          timestamp,
          path,
          method,
        });
      }

      // Handle foreign key constraint violations
      if (error.code === '23503') { // PostgreSQL foreign key violation
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Invalid reference',
          error: 'Bad Request',
          statusCode: HttpStatus.BAD_REQUEST,
          timestamp,
          path,
          method,
        });
      }

      // Handle check constraint violations
      if (error.code === '23514') { // PostgreSQL check violation
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Invalid data provided',
          error: 'Bad Request',
          statusCode: HttpStatus.BAD_REQUEST,
          timestamp,
          path,
          method,
        });
      }

      // Log database errors for debugging
      console.error('Database query error:', {
        code: error.code,
        message: error.message,
        method,
        path,
      });

      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Database operation failed',
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp,
        path,
        method,
      });
    }

    if (exception instanceof EntityNotFoundError) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Entity not found',
        error: 'Not Found',
        statusCode: HttpStatus.NOT_FOUND,
        timestamp,
        path,
        method,
      });
    }

    // 4) Handle other HttpExceptions
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response: any = exception.getResponse();

      const message =
        typeof response === 'string'
          ? response
          : response?.message || exception.message || 'Request failed';

      const errors =
        typeof response === 'object' && response?.errors ? response.errors : null;

      return res.status(statusCode).json({
        success: false,
        message,
        errors,
        statusCode,
        timestamp,
        path,
        method,
      });
    }

    // 5) Handle unknown errors
    console.error('Unhandled exception:', {
      name: exception instanceof Error ? exception.name : 'Unknown',
      message: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
      method,
      path,
      timestamp,
    });

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : (exception instanceof Error ? exception.message : 'Internal server error'),
      error: 'Internal Server Error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp,
      path,
      method,
    });
  }

  private normalizeValidationErrors(messages: any): Record<string, string[]> {
    // If it's a string, return as general error
    if (typeof messages === 'string') {
      return { _error: [messages] };
    }

    // If it's an array of strings, group by field name (first word before space)
    if (Array.isArray(messages)) {
      const grouped: Record<string, string[]> = {};

      for (const msg of messages) {
        if (typeof msg !== 'string') continue;
        const field = msg.split(' ')[0] || '_error'; // "title", "email", etc.
        grouped[field] ??= [];
        grouped[field].push(msg);
      }

      return grouped;
    }

    return { _error: ['Validation failed'] };
  }
}
