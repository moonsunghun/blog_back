/**
 * dotenv-flow 설정 초기화 파일입니다.
 *
 * 이 설정은 실행 환경(`NODE_ENV`)에 따라 `.env`, `.env.local`, `.env.development`, `.env.production` 등
 * 여러 환경 파일을 자동으로 불러와 환경 변수를 등록합니다.
 *
 * 주요 동작:
 * - NODE_ENV 값에 따라 적절한 `.env` 파일을 우선순위에 따라 로드
 * - 기존의 dotenv와 달리 다중 환경 구성에 특화됨
 *
 * 주의사항:
 * - `.env` 파일이 존재하지 않으면 환경 변수는 등록되지 않습니다.
 * - 이 설정은 앱 실행 초기에 가장 먼저 호출되어야 합니다.
 */
import dotEnvironmentFlow from 'dotenv-flow';

/**
 * dotenv-flow를 통해 환경 변수를 로드합니다.
 *
 * @returns void
 * @throws Error `.env` 파일이 손상되었거나 파싱 실패 시
 */
dotEnvironmentFlow.config();
