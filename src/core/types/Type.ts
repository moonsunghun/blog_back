/**
 * HTTP 요청에서 데이터를 추출할 위치를 나타내는 타입입니다.
 *
 * @type {'body' | 'query' | 'params'}
 *
 * @description
 * Express 요청 객체(Request)에서 값을 추출할 때 사용 위치를 명시하기 위한 유틸리티 타입입니다.
 *
 * - `'body'`: `req.body`를 의미하며, POST, PUT 등의 본문 데이터를 처리할 때 사용합니다.
 * - `'query'`: `req.query`를 의미하며, URL에 포함된 쿼리 문자열을 처리할 때 사용합니다.
 * - `'params'`: `req.params`를 의미하며, 라우트 파라미터를 처리할 때 사용합니다.
 *
 * @example
 * function extract<T>(type: HttpRequestType, request: Request): T {
 *   return request[type] as T;
 * }
 */
export type HttpRequestType = 'body' | 'query' | 'params';

/**
 * Swagger 문서 생성을 위한 설정 옵션 타입입니다.
 *
 * 이 타입은 Swagger UI 또는 OpenAPI 문서를 구성할 때 필요한
 * 기본 정보 및 API 문서 스캔 경로 등을 포함합니다.
 *
 * 주요 필드:
 * - title: API 문서의 제목 (선택)
 * - version: API 문서의 버전 (필수)
 * - description: 문서 설명 또는 요약 (선택)
 * - serverUrl: 실제 서버의 URL (예: http://localhost)
 * - port: API 서버가 실행되는 포트 번호
 * - apiFiles: Swagger 주석이 포함된 파일 경로 배열 (glob 형식 사용 가능)
 *
 * 주의사항:
 * - `version`과 `serverUrl`, `port`, `apiFiles`는 필수로 입력해야 Swagger 문서가 정상 생성됩니다.
 * - `apiFiles`는 glob 패턴으로 경로를 지정할 수 있습니다.
 */

export type CookieOptions = {
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: SameSite;
  path?: string;
  encrypted?: boolean;
};

/**
 * Swagger 설정 옵션을 정의하는 타입입니다.
 *
 * @property {string} [title] - Swagger 문서의 제목 (기본값 없음)
 * @property {string} version - API의 버전 정보 (예: "1.0.0")
 * @property {string} [description] - Swagger 문서에 대한 설명 (기본값 없음)
 * @property {string} serverUrl - Swagger 문서에서 표시할 서버의 base URL (예: "http://localhost")
 * @property {number} port - 서버 포트 번호 (예: 3000)
 * @property {string[]} apiFiles - Swagger 문서 생성을 위한 API 파일 경로 배열 (예: ['./routes/*.ts'])
 *
 * @description
 * Swagger 문서 생성을 위한 설정 정보를 담는 옵션 객체입니다.
 * 이 타입을 기반으로 Swagger 설정 유틸리티나 초기화 함수에 필요한 값을 전달합니다.
 *
 * @example
 * const options: SwaggerConfigOptions = {
 *   title: 'API 문서',
 *   version: '1.0.0',
 *   description: '서비스 API에 대한 문서입니다.',
 *   serverUrl: 'http://localhost',
 *   port: 3000,
 *   apiFiles: ['./src/routes/*.ts']
 * };
 */
export type SwaggerConfigOptions = {
  title?: string;
  version: string;
  description?: string;
  serverUrl: string;
  port: number;
  apiFiles: string[];
};

export type SameSite = 'lax' | 'strict' | 'none';

/**
 * 지원하는 데이터베이스 타입을 정의하는 타입입니다.
 *
 * 주요 값:
 * - 'postgres': PostgreSQL
 * - 'mysql': MySQL
 * - 'mariadb': MariaDB
 *
 * 주의사항:
 * - 환경변수 DB_TYPE과 매칭되어야 하며, 지원하지 않는 값 사용 시 오류 발생 가능성 있음
 */
export type SupportedDatabaseType = 'postgres' | 'mysql' | 'mariadb' | 'sqlite';

/**
 * 업로드 가능한 파일의 유형을 정의하는 타입입니다.
 *
 * 이 타입은 파일의 저장 위치를 결정하거나, 처리 방식을 분기할 때 사용됩니다.
 *
 * 주요 값:
 * - 'image': 이미지 파일 (예: png, jpg 등)
 * - 'video': 동영상 파일 (예: mp4, mov 등)
 * - 'document': 문서 파일 (예: pdf, docx, xlsx 등)
 *
 * 주의사항:
 * - 이 타입은 파일 업로드 시 MIME 타입에 따라 동적으로 매핑됩니다.
 * - 잘못된 값이 전달되면 파일 저장이 실패할 수 있으므로, 유효성 검증이 필요합니다.
 */
export type FileType = 'image' | 'video' | 'document';
