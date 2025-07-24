/**
 * express-validator의 유효성 검사 결과를 처리하는 미들웨어입니다.
 *
 * 이 미들웨어는 요청(Request)에 대해 사전 정의된 유효성 검사 결과를 확인하고,
 * 오류가 존재할 경우 HTTP 400 상태 코드와 함께 상세 오류 정보를 반환합니다.
 *
 * 주요 기능:
 * - 요청 파라미터 유효성 검사 실패 시: 400 응답 + 에러 배열 반환
 * - 유효성 검사를 모두 통과한 경우: 다음 미들웨어로 흐름 전달
 *
 * 주의사항:
 * - 반드시 express-validator의 `check`, `body`, `query`, `param` 등과 함께 사용되어야 합니다.
 * - `onlyFirstError: true` 설정을 통해 각 필드당 첫 번째 오류만 반환합니다.
 */

import { NextFunction, Request, Response } from 'express';
import { FieldValidationError, validationResult } from 'express-validator';

/**
 * express-validator의 결과를 확인하고 에러가 있을 경우 클라이언트에 반환합니다.
 *
 * @param request Express 요청 객체
 * @param response Express 응답 객체
 * @param next 다음 미들웨어로 흐름을 전달하는 함수
 * @returns 유효성 검사 실패 시 400 응답, 성공 시 next() 호출
 *
 * @example
 * app.post('/example',
 *   body('email').isEmail(),
 *   validatorErrorCheckerMiddleware,
 *   controllerHandler
 * );
 */
export const validatorErrorCheckerMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array({ onlyFirstError: true }) as FieldValidationError[];

    return response.status(400).json({
      code: 400,
      message: '요청 파라미터 유효성 검사 실패',
      errors: formattedErrors.map((error) => ({
        type: error.type,
        path: error.path,
        message: error.msg,
        location: error.location,
        value: error.value,
      })),
    });
  }

  return next();
};
