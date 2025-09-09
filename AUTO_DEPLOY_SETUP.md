# 🚀 자동 배포 설정 가이드

## 개요
매일 오전 5시 콘텐츠 수집 후 자동으로 사이트를 배포하는 시스템입니다.

## 배포 방법 선택

### 방법 1: Vercel Deploy Hook (추천)

1. **Vercel 대시보드에서 Deploy Hook 생성**
   - Vercel 프로젝트 → Settings → Git → Deploy Hooks
   - Hook Name: `auto-deploy-after-collection`
   - Branch: `main` (또는 배포할 브랜치)
   - "Create Hook" 클릭

2. **환경 변수 설정**
   ```bash
   # Vercel 대시보드 → Settings → Environment Variables
   VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/프로젝트ID/훅ID
   ```

### 방법 2: GitHub Actions

1. **GitHub Secrets 설정**
   ```bash
   # GitHub 리포지토리 → Settings → Secrets and variables → Actions
   VERCEL_TOKEN=your_vercel_token
   VERCEL_ORG_ID=your_org_id  
   VERCEL_PROJECT_ID=your_project_id
   GITHUB_TOKEN=your_github_token
   GITHUB_REPOSITORY=username/honeybee
   ```

2. **Vercel 토큰 발급**
   - Vercel 대시보드 → Settings → Tokens
   - "Create" 클릭하여 새 토큰 생성

3. **프로젝트 ID 확인**
   ```bash
   # Vercel CLI로 확인
   npx vercel ls
   # 또는 .vercel/project.json 파일에서 확인
   ```

## 작동 방식

### 현재 스케줄
- **콘텐츠 수집**: 매일 오전 5시 (KST) 
- **자동 배포**: 새 콘텐츠가 수집되면 즉시 배포 트리거

### 배포 조건
- 새로운 아티클이 수집되었을 때만 배포 실행
- 수집된 아티클이 0개면 배포하지 않음

### 로그 확인
```bash
# Vercel Function 로그에서 확인
📊 수집 요약: {...}
🚀 새 콘텐츠 감지 - 자동 배포 시작
✅ 배포 트리거 성공: {...}
```

## 환경 변수 전체 목록

### 필수 (보안용)
```bash
CRON_SECRET=your_cron_secret_key
```

### 배포용 (둘 중 하나 선택)
```bash
# 방법 1: Vercel Deploy Hook
VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/프로젝트ID/훅ID

# 방법 2: GitHub Actions  
GITHUB_TOKEN=your_github_token
GITHUB_REPOSITORY=username/honeybee
```

## 수동 테스트

### 콘텐츠 수집만 테스트
```bash
curl -X POST http://localhost:3000/api/feeds/refresh
```

### 자동 배포 포함 테스트 (로컬에서는 실제 배포 안됨)
```bash
# 환경 변수 설정 후
curl -H "Authorization: Bearer $CRON_SECRET" \
     https://your-domain.vercel.app/api/cron/collect-feeds
```

## 장애 복구

### 배포 실패 시
1. Vercel 대시보드에서 배포 로그 확인
2. 환경 변수 설정 재확인
3. Deploy Hook URL 유효성 검사

### 수집은 되지만 배포 안될 때
1. Function 로그에서 배포 트리거 에러 확인
2. 환경 변수 `VERCEL_DEPLOY_HOOK_URL` 확인
3. Vercel 프로젝트의 Deploy Hook 상태 확인

## 모니터링

### 성공 로그
```
✅ 자동 콘텐츠 수집 완료: 15개 아티클 (45초 소요)
🚀 새 콘텐츠 감지 - 자동 배포 시작  
✅ 배포 트리거 성공: {"deploymentId": "dpl_xxx", "status": 201}
```

### 실패 로그
```
❌ 배포 트리거 실패: VERCEL_DEPLOY_HOOK_URL 환경 변수가 설정되지 않았습니다
```

## 비용 최적화

- 새 콘텐츠가 없으면 배포하지 않음
- Vercel Deploy Hook 사용 시 빌드 비용만 발생
- 콘텐츠 수집은 매일 1회만 실행

---

**📝 참고**: 환경 변수는 Vercel 대시보드에서 설정하고, 설정 후 다시 배포해야 적용됩니다.