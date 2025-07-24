# Node.js 18 Alpine 이미지 사용
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 매니저 설정
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN yarn build

# 프로덕션 이미지
FROM node:18-alpine AS production

# 작업 디렉토리 설정
WORKDIR /app

# 프로덕션 의존성만 설치
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# 빌드된 파일 복사
COPY --from=builder /app/dist ./dist

# 세션 저장소 디렉토리 생성
RUN mkdir -p sessions

# 포트 노출
EXPOSE 3000

# 헬스 체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 애플리케이션 실행
CMD ["node", "dist/server.js"] 