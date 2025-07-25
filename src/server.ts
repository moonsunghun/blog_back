/**
 * 통합 백엔드 서비스의 메인 서버 파일입니다.
 *
 * 이 서버는 다음 서비스들을 통합하여 제공합니다:
 * - Core 서비스 (핵심 기능)
 * - Common 서비스 (공통 기능)
 * - Front Office API (사용자용 API)
 * - Back Office API (관리자용 API)
 * - AI Service (AI 관련 기능)
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import FileStore from 'session-file-store';
// import swaggerUi from 'swagger-ui-express';
// import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import 'reflect-metadata';

// 환경 변수 로드
dotenv.config();

// 데이터베이스 설정
import { AppDataSource } from './core/config/DatabaseConfig';

// 미들웨어 import
import { errorHandler } from './shared/middlewares/ErrorHandler';
import { requestLogger } from './shared/middlewares/RequestLogger';
import { morganMiddleware } from './core/middlewares/MorganMiddleware';

// COMMON 서비스 컨트롤러들
import { BlogCommentReplyController } from './common/api/controllers/blog/BlogCommentReplyController';
import { BlogCommentController } from './common/api/controllers/blog/BlogCommentController';
import { BlogController as CommonBlogController } from './common/api/controllers/blog/BlogController';
import { InquiryController as CommonInquiryController } from './common/api/controllers/inquiry/InquiryController';
import { InquiryCommentController } from './common/api/controllers/inquiry/InquriyCommentController';
import { InquiryCommentReplyController } from './common/api/controllers/inquiry/InquiryCommentReplyController';
import { AuthenticateController } from './common/api/controllers/authentication/AuthenticateController';
import { UserMyPageController } from './common/api/controllers/user/UserController';
import { CareerController as CommonCareerController } from './common/api/controllers/portfolio/CareerController';
import { PersonalInformationController as CommonPersonalInformationController } from './common/api/controllers/portfolio/PersonalInformationController';
import { EducationController as CommonEducationController } from './common/api/controllers/portfolio/EducationController';
import { PortfolioController as CommonPortfolioController } from './common/api/controllers/portfolio/PortfolioController';

// FRONT-OFFICE 서비스 컨트롤러들
import { InquiryController as FrontInquiryController } from './front-office/api/controllers/InquiryController';
import { GuestAuthenticateController } from './front-office/api/controllers/GuestAuthenticateController';
import { UserController as FrontUserController } from './front-office/api/controllers/UserController';

// BACK-OFFICE 서비스 컨트롤러들
import { CareerController as BackCareerController } from './back-office/api/controllers/CareerController';
import { EducationController as BackEducationController } from './back-office/api/controllers/EducationController';
import { PersonalInformationController as BackPersonalInformationController } from './back-office/api/controllers/PersonalInformationController';
import { PortfolioController as BackPortfolioController } from './back-office/api/controllers/PortfolioController';
import { BlogController as BackBlogController } from './back-office/api/controllers/BlogController';
import { InquiryController as BackInquiryController } from './back-office/api/controllers/InquiryController';
import { UserController as BackUserController } from './back-office/api/controllers/UserController';

const app = express();
const PORT = process.env.PORT || 8080;

const SERVER_URI_PREFIX = '/api';

// 기본 미들웨어 설정
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      (process.env.NODE_ENV === 'production'
        ? ['https://frontend-lac-iota-10.vercel.app']
        : ['http://localhost:3000']),
    credentials: true,
  })
);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 세션 설정
// const FileStoreSession = FileStore(session);
app.use(
  session({
    // store: new FileStoreSession({
    //   path: '/home/ubuntu/blog_back/sessions', // 절대 경로로 변경
    //   ttl: 86400,
    // }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // 자체 서명 인증서로 인해 false로 변경
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24시간
      sameSite: 'lax', // none에서 lax로 변경하여 쿠키 저장 허용
    },
  }) as any
);

// 커스텀 미들웨어
app.use(requestLogger);

// Swagger 설정
// const swaggerOptions = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: '404-Found API',
//       version: '1.0.0',
//       description: '통합 백엔드 API 문서',
//     },
//     servers: [
//       {
//         url: `http://localhost:${PORT}`,
//         description: '개발 서버',
//       },
//     ],
//   },
//   apis: ['./src/**/*.ts'],
// };
//
// const swaggerSpec = swaggerJsdoc(swaggerOptions);
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: ['core', 'common', 'front-office', 'back-office', 'ai-service'],
  });
});

app.use(morganMiddleware);

/////////////////////// COMMON API ///////////////////////
// 인증 관련
app.use(
  SERVER_URI_PREFIX + '/authentication',
  new AuthenticateController().router
);

// 회원 마이페이지
app.use(SERVER_URI_PREFIX + '/users', new UserMyPageController().router);

// 포트폴리오
app.use(SERVER_URI_PREFIX, new CommonPersonalInformationController().router);
app.use(SERVER_URI_PREFIX, new CommonEducationController().router);
app.use(SERVER_URI_PREFIX, new CommonCareerController().router);
app.use(SERVER_URI_PREFIX, new CommonPortfolioController().router);

// 문의 게시판
app.use(SERVER_URI_PREFIX, new CommonInquiryController().router);
app.use(SERVER_URI_PREFIX, new InquiryCommentController().router);
app.use(SERVER_URI_PREFIX, new InquiryCommentReplyController().router);

// 블로그
app.use(SERVER_URI_PREFIX, new CommonBlogController().router);
app.use(SERVER_URI_PREFIX, new BlogCommentController().router);
app.use(SERVER_URI_PREFIX, new BlogCommentReplyController().router);

/////////////////////////////////////////////////////////////////

/////////////////////// FRONT OFFICE API ///////////////////////

app.use(SERVER_URI_PREFIX, new FrontInquiryController().router);
app.use(SERVER_URI_PREFIX, new GuestAuthenticateController().router);

// 회원 탈퇴
app.use(SERVER_URI_PREFIX + '/users', new FrontUserController().router);

/////////////////////////////////////////////////////////////////

/////////////////////// BACK OFFICE API ///////////////////////

app.use(SERVER_URI_PREFIX, new BackCareerController().router);
app.use(SERVER_URI_PREFIX, new BackEducationController().router);
app.use(SERVER_URI_PREFIX, new BackPersonalInformationController().router);
app.use(SERVER_URI_PREFIX, new BackPortfolioController().router);
app.use(SERVER_URI_PREFIX, new BackBlogController().router);
app.use(SERVER_URI_PREFIX, new BackInquiryController().router);
app.use(SERVER_URI_PREFIX, new BackUserController().router);

/////////////////////////////////////////////////////////////////

// // API 라우트 설정
// app.use('/api/core', coreRoutes);
// app.use('/api/common', commonRoutes);

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// 에러 핸들러 (마지막에 위치)
app.use(errorHandler);

// 서버 시작 함수
const startServer = async () => {
  try {
    // 데이터베이스 연결 초기화
    console.log('🔗 데이터베이스 연결 초기화 중...');
    await AppDataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공');

    // 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 통합 백엔드 서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`📚 API 문서: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 헬스 체크: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

// 서버 시작
startServer();

export default app;
