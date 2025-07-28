/**
 * Express 애플리케이션에서 세션을 관리하는 미들웨어입니다.
 *
 * 이 미들웨어는 `express-session`을 사용하여 서버 측 세션을 생성하고,
 * 사용자 인증 상태나 기타 세션 기반 정보를 저장할 수 있도록 합니다.
 *
 * 주요 설정:
 * - `secret`: 세션 암호화 키 (환경 변수 SESSION_SECRET 사용, 기본값 존재)
 * - `resave`: 변경되지 않은 세션을 다시 저장하지 않음
 * - `saveUninitialized`: 초기화되지 않은 세션을 저장하지 않음
 * - `cookie.maxAge`: 세션 쿠키 유효 시간은 2시간 (단위: 밀리초)
 *
 * 주의사항:
 * - `maxAge` 설정에 논리 오류가 있어 실제 값이 0으로 평가될 수 있습니다.
 *   → `(1000 * 60 * 60)`로 수정 필요
 */
import { RequestHandler } from 'express';
import session from 'express-session';

import * as process from 'node:process';
import FileStoreFactory from 'session-file-store';
import path from 'node:path';
import { makeDirectory } from '../utilities/Generater';

// session 객체를 주입해서 FileStore 생성자 생성
const FileStoreConstructor = FileStoreFactory(session);

const sessionStoragePath = path.resolve(
  __dirname,
  '../../../../apps/backend-core/storage/session/'
);

makeDirectory(sessionStoragePath);

/**
 * express-session을 기반으로 세션을 관리하는 미들웨어입니다.
 *
 * @returns Express에서 사용할 수 있는 RequestHandler 형태의 미들웨어
 * @throws Error 세션 설정 중 환경 변수 미설정 등으로 인한 예외는 따로 처리하지 않음
 */
export const sessionMiddleware: RequestHandler = session({
  store: new FileStoreConstructor({
    path: sessionStoragePath,
    retries: 1,
  }),
  secret:
    process.env.SESSION_SECRET ??
    '6rCc67Cc7IOI67CcLWJsb2ctcG9ydGZvbGlvLXR1cmJvcmVwby1leHByZXNzLW5leHQtZGV2ZWxvcG1lbnQK',
  resave: false,
  saveUninitialized: false,
  cookie: {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.NODE_ENV === 'production' ? '.shmoon.site' : undefined,
    maxAge: 24 * 60 * 60 * 1000, // 24시간
  },
}) as any;
