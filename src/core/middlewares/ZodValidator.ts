import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodObject, ZodRawShape } from 'zod';
import { HttpRequestType } from '../types/Type';
import { ZodValidationError } from '../api/exception/ZodValidationError';

/**
 * HTTP 요청 객체의 각 영역(body, query, params)에 대해 Zod 스키마를 정의하는 타입입니다.
 *
 * 이 타입은 validateRequest 미들웨어에서 사용되며, 각 요청 영역의 유효성 검사를 수행할 수 있도록 Zod 스키마를 지정합니다.
 * 모든 필드는 선택적으로 지정 가능하며, 필요한 부분만 선언하여 사용하면 됩니다.
 *
 * @property body - request.body에 대한 Zod 스키마
 * @property query - request.query에 대한 Zod 스키마
 * @property params - request.params에 대한 Zod 스키마
 *
 */
type SchemaGroup = {
  params?: ZodObject<ZodRawShape>;
  query?: ZodObject<ZodRawShape>;
  body?: ZodObject<ZodRawShape>;
};

/**
 * Zod 스키마를 기반으로 Express 요청 객체의 params, query, body를 유효성 검사하는 미들웨어입니다.
 *
 * 각 스키마는 개별적으로 안전하게 검증되며, 실패 시 요청을 중단하고 400 응답과 함께 에러 상세 정보를 반환합니다.
 * 성공할 경우, 요청 객체에 파싱된 값을 할당하고 다음 미들웨어로 넘어갑니다.
 *
 * 예외 응답 형식:
 *
 json
 * {
 *   "message": "유효성 검사 실패",
 *   "errors": {
 *     "body": {
 *       "fieldErrors": {
 *         "exampleField": ["Example error message"]
 *       }
 *     }
 *   }
 * }
 *
 *
 * @param schema 검증할 Zod 스키마 객체 집합 (body, query, params 중 필요한 항목만 포함 가능)
 * @returns Express 미들웨어 함수
 *
 */
export const validateRequest = (schema: SchemaGroup) => {
  return (request: Request, response: Response, nextFunction: NextFunction) => {
    let result;
    try {
      if (schema.params) {
        result = schema.params.safeParse(request.params);

        if (!result.success) {
          throw new ZodValidationError(formatZodError('params', result.error));
        }

        request.params = result.data;
      }

      if (schema.query) {
        result = schema.query.safeParse(request.query);

        if (!result.success) {
          throw new ZodValidationError(formatZodError('query', result.error));
        }

        request.query = result.data;
      }

      if (schema.body) {
        result = schema.body.safeParse(request.body);

        if (!result.success) {
          throw new ZodValidationError(formatZodError('body', result.error));
        }

        request.body = result.data;
      }

      nextFunction();
    } catch (error: any) {
      return response.status(400).json({
        message: '유효성 검사 실패',
        errors: error,
      });
    }
  };

  /**
   * Zod 에러 객체를 사람이 읽기 쉬운 메시지로 변환
   * @param target - 예: 'body', 'query', 'params'
   * @param error - ZodError 객체
   */
  function formatZodError(target: HttpRequestType, error: ZodError): string {
    return (
      `[${target}] ` +
      error.errors
        .map((e) => {
          const path = e.path.join('.') || '(root)';
          return `${path}: ${e.message}`;
        })
        .join(' | ')
    );
  }
};
