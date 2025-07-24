import { NextFunction, Request, Response } from 'express';
import { HttpExceptionResponse } from '../api/exception/HttpExceptionResponse';
import { ZodValidationError } from '../api/exception/ZodValidationError';
import { logger } from '../utilities/Logger';

export const globalExceptionHandler = (
  error: any,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  logger.error(`[GlobalError] ${error?.message}`);

  if (error instanceof HttpExceptionResponse || error instanceof ZodValidationError) {
    return response.status(error.statusCode).json({
      statusCode: error.statusCode,
      message: error.message,
    });
  }

  return response.status(500).json({
    statusCode: 500,
    message: '서버에서 알 수 없는 오류가 발생했어요.',
  });
};
