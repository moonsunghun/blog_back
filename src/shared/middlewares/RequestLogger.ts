import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // 응답이 완료된 후 로깅
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    if (res.statusCode >= 400) {
      console.warn(`[WARN] ${logMessage}`);
    } else {
      console.log(`[INFO] ${logMessage}`);
    }
  });

  next();
};
