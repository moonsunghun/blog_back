/**
 * TypeORM의 AppDataSource 설정 파일입니다.
 *
 * 이 설정은 실행 환경(`NODE_ENV`) 및 데이터베이스 종류(`DB_TYPE`)에 따라
 * 자동으로 PostgreSQL, SQLite 설정을 구성합니다.
 *
 * 주요 기능:
 * - production 환경: 환경변수 기반 외부 RDB 연결 설정
 * - local/development 환경: SQLite 파일 기반 로컬 DB 사용
 * - 공통 설정: 엔티티 경로 등록, 로깅 활성화
 *
 * 주의사항:
 * - production 환경에서 `DB_TYPE`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` 등이 누락되면 오류 발생 가능
 * - `AppDataSource.initialize()` 호출은 외부에서 수행해야 연결이 활성화됩니다
 */
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'node:path';
import { SupportedDatabaseType } from '../types/Type';
import { makeDirectory } from '../utilities/Generater';

dotenv.config();

const rootPath = path.resolve(__dirname, '../../../..');

/**
 * 공통 DB 설정: 로깅 활성화 및 엔티티 경로 정의
 */
const common = {
  logging: true,
  entities: [
    path.join(__dirname, '../models/entities/**/*.ts'),
    path.join(__dirname, '../models/entities/**/*.js'),
  ],
};

const dbType = process.env.DB_TYPE as SupportedDatabaseType;

const backendRoot = path.resolve(__dirname, '../../..');
const sqlitePath = path.join(backendRoot, 'database/embedded/db.sqlite');
const embeddedPath = path.join(backendRoot, 'database/embedded');

makeDirectory(embeddedPath);

/**
 * TypeORM DataSource 설정 객체입니다.
 *
 * @returns PostgreSQL 또는 SQLite 기반 설정
 */
const options =
  process.env.NODE_ENV === 'production' && dbType
    ? {
        type: dbType,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT ?? '5432'),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: false,
        ...common,
      }
    : {
        type: 'sqlite',
        database: sqlitePath,
        synchronize: true,
        ...common,
      };

/**
 * TypeORM DataSource 인스턴스입니다.
 * 외부에서 `.initialize()` 호출로 연결을 활성화해야 합니다.
 */
export const AppDataSource = new DataSource(options as any);
