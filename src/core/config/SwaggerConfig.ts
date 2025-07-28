import { SwaggerConfigOptions } from '../types/Type';
import { Express } from 'express';
// import swaggerJSDoc, { Options } from 'swagger-jsdoc';
// import swaggerUi from 'swagger-ui-express';
import path from 'node:path';

/**
 * Swagger 문서를 Express 애플리케이션에 등록하는 유틸 함수입니다.
 *
 * 이 함수는 swagger-jsdoc과 swagger-ui-express를 사용하여
 * API 명세서를 `/api-docs` 경로에 자동으로 생성 및 제공하며,
 * 프로젝트의 DTO, 컨트롤러, 상수 정의 파일 등에서 Swagger 주석을 수집합니다.
 *
 * 주요 기능:
 * - OpenAPI 3.0 명세 기반 설정
 * - API 버전, 설명, 서버 주소 등 동적 구성
 * - 공통 스키마(PageResponse, ErrorResponse) 포함
 *
 * 주의사항:
 * - `options.apiFiles` 외에 내부적으로 경로도 자동 포함됩니다.
 * - Swagger 문서는 `/api-docs` 경로에서 확인할 수 있습니다.
 * - controller 및 DTO 파일에 Swagger 주석이 올바르게 작성되어 있어야 문서가 정상 생성됩니다.
 *
 * @param app Swagger를 적용할 Express 애플리케이션 인스턴스
 * @param options Swagger 설정 옵션 객체 (title, version, serverUrl 등)
 *
 * @example
 * generateSwaggerSpec(app, {
 *   version: '1.0.0',
 *   description: '관리자 API 문서',
 *   serverUrl: 'http://localhost',
 *   port: 3000,
 *   apiFiles: [
 *   {...}
 *   ]
 * });
 */
export const generateSwaggerSpec = (
  app: Express,
  options: SwaggerConfigOptions
) => {
  const {
    title = '개발새발 404 Found API',
    version,
    description,
    serverUrl,
    port,
    apiFiles,
  } = options;

  // 상수 등 공통 경로 포함
  const combinedApiFiles = [
    ...apiFiles,
    path.resolve(__dirname, '../constant/**/*.ts'),
  ];

  const swaggerOptions: any = {
    definition: {
      openapi: '3.0.0',
      info: { title, version, description },
      servers: [{ url: `${serverUrl}:${port}` }],
      security: [
        {
          bearerAuth: [],
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description:
              'JWT 토큰을 Authorization 헤더에 Bearer 형식으로 전달하세요.',
          },
        },
        schemas: {
          PageResponse: {
            type: 'object',
            properties: {
              totalItems: { type: 'integer' },
              totalPages: { type: 'integer' },
              currentPage: { type: 'integer' },
              pageSize: { type: 'integer' },
              data: {
                type: 'array',
                items: { type: 'object' },
              },
            },
          },

          ErrorResponse: {
            type: 'object',
            properties: {
              code: { type: 'integer' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    apis: combinedApiFiles,
  };

  // const swaggerSpec = swaggerJSDoc(swaggerOptions);

  // Swagger UI 라우팅 등록
  // app.use('/api-docs', swaggerUi.serve as any, (swaggerUi.setup(swaggerSpec) as any));
};
