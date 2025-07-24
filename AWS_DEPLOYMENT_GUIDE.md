# 404-Found Backend AWS 배포 가이드

## 🚀 배포 개요

이 가이드는 404-Found 백엔드를 AWS EC2에 배포하는 방법을 설명합니다.

## 📋 사전 준비사항

### 1. AWS 리소스 설정

#### EC2 인스턴스

- **인스턴스 타입**: t3.micro (무료 티어) 또는 t3.small (권장)
- **AMI**: Ubuntu 22.04 LTS
- **보안 그룹 설정**:
  - SSH (22): 내 IP
  - HTTP (80): 0.0.0.0/0
  - HTTPS (443): 0.0.0.0/0
  - Custom (8080): 0.0.0.0/0

#### RDS 데이터베이스 (선택사항)

- **엔진**: PostgreSQL 15
- **인스턴스 클래스**: db.t3.micro
- **스토리지**: 20GB gp2

### 2. EC2 초기 설정

```bash
# EC2 인스턴스에 SSH 접속
ssh -i your-key.pem ubuntu@your-ec2-ip

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 18 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Yarn 설치
npm install -g yarn

# PM2 설치
npm install -g pm2

# Nginx 설치 (선택사항)
sudo apt install nginx -y

# Docker 설치 (Docker 사용시)
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker ubuntu
```

## 🔧 배포 방법

### 방법 1: 직접 배포

1. **코드 복사**

```bash
# EC2에서 실행
git clone https://github.com/your-username/404-found-backend.git
cd 404-found-backend
```

2. **환경 변수 설정**

```bash
# 프로덕션 환경 변수 복사
cp env.production.example .env

# .env 파일 편집
nano .env
```

3. **배포 실행**

```bash
chmod +x deploy.sh
./deploy.sh
```

### 방법 2: Docker Compose 사용

1. **환경 변수 설정**

```bash
cp env.production.example .env
nano .env  # 실제 값으로 수정
```

2. **Docker Compose 실행**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 방법 3: GitHub Actions 자동 배포

1. **GitHub Secrets 설정**

- `AWS_ACCESS_KEY_ID`: AWS Access Key
- `AWS_SECRET_ACCESS_KEY`: AWS Secret Key
- `EC2_SSH_PRIVATE_KEY`: EC2 SSH 개인키
- `EC2_HOST`: EC2 퍼블릭 IP
- `EC2_USER`: ubuntu

2. **main 브랜치에 푸시하면 자동 배포**

## 🔒 보안 설정

### 1. Nginx 설정 (선택사항)

```bash
# Nginx 설정 파일 복사
sudo cp nginx.conf /etc/nginx/sites-available/404-found-backend
sudo ln -s /etc/nginx/sites-available/404-found-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. SSL 인증서 설정 (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### 3. 방화벽 설정

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## 🔍 모니터링 및 로그

### PM2 명령어

```bash
# 상태 확인
pm2 status

# 로그 확인
pm2 logs 404-found-backend

# 재시작
pm2 restart 404-found-backend

# 모니터링
pm2 monit
```

### 로그 파일 위치

- 애플리케이션 로그: `./logs/`
- Nginx 로그: `/var/log/nginx/`

## 🚨 문제 해결

### 일반적인 문제들

1. **포트 충돌**

```bash
# 포트 사용 중인 프로세스 확인
sudo lsof -i :8080
```

2. **환경 변수 오류**

```bash
# .env 파일 확인
cat .env
```

3. **데이터베이스 연결 오류**

```bash
# RDS 보안 그룹 확인
# EC2에서 RDS로의 5432 포트 접근 허용 필요
```

## 📞 추가 도움

배포 중 문제가 발생하면 다음을 확인하세요:

- EC2 보안 그룹 설정
- RDS 보안 그룹 설정 (사용시)
- 환경 변수 설정
- PM2 로그
