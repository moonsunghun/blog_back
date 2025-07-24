import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (error: AppError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // 개발 환경에서는 스택 트레이스 포함
  const response: any = {
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  console.error(`[ERROR] ${statusCode} - ${message}`, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: error.stack,
  });

  res.status(statusCode).json(response);
};
