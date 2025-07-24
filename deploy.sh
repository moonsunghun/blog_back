#!/bin/bash

# 404-Found Backend 배포 스크립트 (AWS 최적화)

echo "🚀 404-Found Backend AWS 배포 시작..."

# 환경 설정
export NODE_ENV=production

# 의존성 설치
echo "📦 의존성 설치 중..."
yarn install --frozen-lockfile --production

# TypeScript 빌드
echo "🔨 TypeScript 빌드 중..."
yarn build

# 로그 디렉토리 생성
mkdir -p logs
mkdir -p sessions

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "⚠️  .env 파일이 없습니다. env.example을 참고하여 생성해주세요."
    exit 1
fi

# PM2로 애플리케이션 재시작
echo "🔄 애플리케이션 재시작 중..."
pm2 reload ecosystem.config.js --env production

# PM2 저장
pm2 save

echo "✅ 배포 완료!"
echo "📊 PM2 상태 확인:"
pm2 status 