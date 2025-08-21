# 🐝 HoneyBee UI 영역별 용어 정리

## 📍 전체 레이아웃 구조

```
┌─────────────────────────────────────────┐
│                HEADER                   │ 
├─────────────────────────────────────────┤
│               MAIN CONTENT              │
│ ┌─────────────────────────────────────┐ │
│ │          SEARCH SECTION             │ │
│ ├─────────────────────────────────────┤ │
│ │         STATS SECTION               │ │
│ ├─────────────────────────────────────┤ │
│ │        CATEGORY TABS                │ │
│ ├─────────────────────────────────────┤ │
│ │        ARTICLE GRID                 │ │
│ ├─────────────────────────────────────┤ │
│ │         CTA SECTION                 │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 🎯 세부 영역별 용어

### 1. HEADER (헤더)
- **Logo Area**: 로고 영역
  - `Logo Icon`: 🐝 아이콘 (노란색 원형 배경)
  - `Brand Text`: "HoneyBee" 텍스트 (그라데이션)
- **Navigation Area**: 내비게이션 영역
  - `Login Button`: 로그인 버튼 (Ghost 스타일)
  - `Signup Button`: 회원가입 버튼 (Primary 스타일)

### 2. SEARCH SECTION (검색 영역)
- **Search Input**: 검색 입력창
  - `Search Icon`: 돋보기 아이콘 (왼쪽)
  - `Placeholder Text`: "키워드, 기술명, 작가명으로 검색해보세요..."

### 3. STATS SECTION (통계 영역)
- **Stats Cards**: 통계 카드들
  - `Hot Articles Card`: "핫한 글" 카드
    - `Stats Icon`: TrendingUp 아이콘
    - `Stats Number`: 숫자 (15)
    - `Stats Label`: 라벨 텍스트
  - `Hot Keywords Card`: "핫한 키워드" 카드
    - `Stats Icon`: Star 아이콘
    - `Stats Number`: 숫자 (32)
    - `Stats Label`: 라벨 텍스트

### 4. CATEGORY TABS (카테고리 탭)
- **Tabs Container**: 탭 컨테이너
  - `All Tab`: 전체 탭
  - `Frontend Tab`: 프론트엔드 탭
  - `Backend Tab`: 백엔드 탭
  - `AI/ML Tab`: AI/ML 탭
  - `DevOps Tab`: DevOps 탭
  - `Design Tab`: 기획/디자인 탭

### 5. ARTICLE GRID (아티클 그리드)
- **Article Cards**: 아티클 카드들 (3x2 그리드)
  - `Card Thumbnail`: 카드 썸네일 (상단 이미지 영역)
    - `Tech Badge`: 기술 라벨 ("Next.js 15" 등)
  - `Card Content`: 카드 콘텐츠
    - `Source Badge`: 출처 배지 ("토스", "당근마켓" 등)
    - `Author Name`: 작가명 ("김개발")
    - `Timestamp`: 시간 ("2시간 전")
    - `Article Title`: 글 제목
    - `Article Description`: 글 설명
    - `Tag Pills`: 해시태그 (#Next.js, #프론트엔드)

### 6. CTA SECTION (액션 영역)
- **Load More Button**: "더 많은 글 보기" 버튼

## 🎨 컬러 테마 용어

### Primary Colors (주요 색상)
- `Honey Yellow`: 메인 노란색 (#fbbf24 ~ yellow-400)
- `Amber`: 호박색 (#f59e0b ~ amber-500)
- `Orange`: 오렌지색 (#ea580c ~ orange-600)

### UI States (상태별 색상)
- `Default State`: 기본 상태
- `Hover State`: 호버 상태
- `Active State`: 활성 상태 (탭)
- `Focus State`: 포커스 상태 (입력창)

## 📱 반응형 용어

### Breakpoints (중단점)
- `Mobile`: 768px 미만
- `Tablet`: 768px ~ 1024px
- `Desktop`: 1024px 이상

### Grid System (그리드 시스템)
- `2-Column Grid`: 태블릿 (md:grid-cols-2)
- `3-Column Grid`: 데스크탑 (lg:grid-cols-3)

## 🎭 애니메이션 용어

### Motion States (모션 상태)
- `Initial State`: 초기 상태
- `Animate State`: 애니메이션 상태
- `Hover Animation`: 호버 애니메이션
- `Transition`: 전환 효과

### Specific Animations (특정 애니메이션)
- `Fade In`: 페이드 인 효과 (통계 카드)
- `Scale Up`: 스케일 업 (호버 시 확대)
- `Icon Rotation`: 아이콘 회전 (360도)

## 📋 사용 예시

**올바른 지칭 방법:**
- "Header의 Logo Icon 크기를 키워줘"
- "Stats Section의 Hot Articles Card를 수정해줘"  
- "Article Grid의 Card Thumbnail 배경색을 바꿔줘"
- "Category Tabs의 All Tab 활성화 색상을 조정해줘"
- "CTA Section의 Load More Button 텍스트를 바꿔줘"

이제 정확한 용어로 소통할 수 있습니다! 🎯