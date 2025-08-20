# 🐝 HoneyBee

**IT 출판사 기획자를 위한 콘텐츠 큐레이션 플랫폼**

## 📖 프로젝트 소개

HoneyBee는 IT 출판사의 기획자들이 다양한 플랫폼에서 발행되는 기술 콘텐츠를 한눈에 모아보고, 트렌드를 파악하며, 잠재적인 저자를 발굴할 수 있도록 도와주는 웹 플랫폼입니다.

## ✨ 주요 기능

- 📰 **콘텐츠 애그리게이션**: 토스, 당근마켓, 네이버 등 주요 IT 기업 블로그 및 개인 플랫폼 큐레이션
- 🔥 **실시간 트렌드**: 핫한 키워드와 기술 동향 분석
- 👥 **인플루언서 발굴**: 특정 주제에 전문성을 가진 작가 추천
- 📊 **인사이트 대시보드**: 기획자를 위한 데이터 기반 인사이트

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Library**: Shadcn/UI
- **Animation**: Framer Motion
- **Styling**: Glassmorphism design with gradient backgrounds

## 🎨 디자인 특징

- 모던한 글래스모피즘 디자인
- 부드러운 애니메이션과 전환 효과
- 반응형 레이아웃
- 직관적인 사용자 인터페이스

## 🚀 시작하기

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 개발 도구

프로젝트에는 Claude Code 상태 모니터링 도구가 포함되어 있습니다:

```bash
# 간단한 상태 모니터
./claude-simple-status.sh

# 고급 상태바
./claude-status.sh

# Node.js 버전
node claude-status-bar.js
```

## 📁 프로젝트 구조

```
honeybee/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/          # Shadcn/UI 컴포넌트
│   │   └── animated-stats.tsx
│   └── lib/
│       └── utils.ts
├── claude-*.sh          # 상태 모니터링 도구
└── README.md
```

## 🎯 로드맵

- [ ] 실제 RSS/API 연동
- [ ] 사용자 인증 시스템
- [ ] 개인화된 대시보드
- [ ] 키워드 알림 기능
- [ ] 작가 프로필 상세 페이지

## 🤝 기여하기

이 프로젝트는 Claude Code로 개발되었습니다. 기여를 환영합니다!

## 📄 라이선스

MIT License

---

**Made with ❤️ using Claude Code**
