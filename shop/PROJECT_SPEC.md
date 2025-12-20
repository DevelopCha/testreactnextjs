# Commerce-Lab 프로젝트 스펙 문서

## 📋 프로젝트 개요

**프로젝트명**: Commerce-Lab  
**목적**: Next.js 기반 이커머스 학습 프로젝트 (프론트엔드 개발 및 테스트)  
**특징**: API 서버 없이 Mock Data로 프론트엔드 독립 개발

---

## 🛠️ 기술 스택

### 프론트엔드
- **프레임워크**: Next.js 14 (Pages Router)
- **언어**: TypeScript
- **UI 라이브러리**: React 18
- **스타일링**: Tailwind CSS
- **상태 관리**: 
  - React Query (@tanstack/react-query) - 서버 상태
  - React Context - 전역 상태 (인증 등)
- **폼 관리**: React Hook Form + Zod
- **테스트**: Jest + React Testing Library

### 백엔드 (실제 운영)
- **프레임워크**: Spring Boot (현재는 Mock으로 대체)
- **API 통신**: RESTful API

### Mock API
- **방식**: JSON 파일 기반 Mock Data
- **위치**: `src/api-mocks/db.json`
- **클라이언트**: `src/lib/api-client.ts` (MockApiClient)

---

## 📁 프로젝트 구조

```
c:\workspace\
├── src/
│   ├── api-mocks/          # Mock 데이터
│   │   └── db.json         # JSON 기반 더미 데이터
│   │
│   ├── components/         # 재사용 컴포넌트
│   │   ├── Layout.tsx      # 레이아웃 (Header + Footer)
│   │   ├── Header.tsx      # 헤더
│   │   ├── Footer.tsx      # 푸터 (모바일 스타일)
│   │   ├── AuthGuard.tsx   # 인증 가드
│   │   └── ProtectedRoute.tsx  # 보호 라우트
│   │
│   ├── context/            # React Context
│   │   ├── AuthContext.tsx     # 인증 상태
│   │   └── PasswordContext.tsx # 비밀번호 확인 상태
│   │
│   ├── hooks/              # 커스텀 훅
│   │   ├── useDebounce.ts
│   │   └── useIntersectionObserver.ts
│   │
│   ├── lib/                # 유틸리티
│   │   ├── api-client.ts   # Mock API 클라이언트
│   │   └── password-config.ts  # 보호 경로 설정
│   │
│   ├── pages/              # Next.js 페이지
│   │   ├── _app.tsx        # App 진입점
│   │   ├── index.tsx       # 홈
│   │   ├── api/            # API Routes
│   │   ├── auth/           # 인증 페이지
│   │   ├── product/        # 상품 페이지
│   │   ├── cart/           # 장바구니
│   │   ├── mypage/         # 마이페이지
│   │   └── verify.tsx      # 비밀번호 확인
│   │
│   ├── docs/               # 문서
│   │   ├── AuthFlow.md
│   │   ├── ApiHandling.md
│   │   └── ProtectedRouteGuide.md
│   │
│   ├── dp/                 # DP 알고리즘 예제
│   │   ├── examples.ts
│   │   └── README.md
│   │
│   └── styles/             # 스타일
│       └── globals.css
│
├── __tests__/              # 테스트 파일
├── middleware.ts           # Next.js Middleware
├── jest.config.js          # Jest 설정
├── next.config.js          # Next.js 설정
├── tailwind.config.js      # Tailwind 설정
├── tsconfig.json           # TypeScript 설정
└── package.json            # 의존성
```

---

## 🔌 API 통신 방식

### Mock API 클라이언트

**파일**: `src/lib/api-client.ts`

```typescript
// Mock 데이터 기반 API 클라이언트
class MockApiClient {
  private data: any;
  
  // JSON 파일에서 데이터 로드
  constructor() {
    this.data = require('@/api-mocks/db.json');
  }
  
  // GET 요청
  async get<T>(endpoint: string): Promise<T[]> {
    return this.data[endpoint] || [];
  }
  
  // POST 요청 (추가)
  async post<T>(endpoint: string, data: T): Promise<T> {
    // 메모리에 추가 (실제 저장 안 됨)
    return data;
  }
  
  // PUT 요청 (수정)
  async put<T>(endpoint: string, id: number, data: T): Promise<T> {
    return data;
  }
  
  // DELETE 요청 (삭제)
  async delete(endpoint: string, id: number): Promise<void> {
    // 메모리에서 삭제
  }
}

export const apiClient = new MockApiClient();
```

### Mock 데이터 구조

**파일**: `src/api-mocks/db.json`

```json
{
  "products": [
    { "id": 1, "name": "상품1", "price": 10000 }
  ],
  "users": [
    { "id": 1, "email": "user@example.com", "name": "홍길동" }
  ],
  "cart": [],
  "orders": []
}
```

### 사용 예시

```typescript
import { apiClient } from '@/lib/api-client';

// 상품 목록 조회
const products = await apiClient.get('products');

// 장바구니 추가
await apiClient.post('cart', { productId: 1, quantity: 2 });
```

---

## 🎨 UI/UX 특징

### 모바일 우선 디자인
- **반응형**: 모바일 → 태블릿 → 데스크톱
- **푸터**: 모바일 하단 고정 네비게이션
- **다크 모드**: 지원

### 레이아웃 구조
```
┌─────────────────┐
│     Header      │  ← 로고, 메뉴, 로그인
├─────────────────┤
│                 │
│   Main Content  │  ← 페이지 콘텐츠
│                 │
├─────────────────┤
│     Footer      │  ← 모바일 네비게이션 (고정)
└─────────────────┘
```

---

## 🔐 인증 시스템

### 1. 일반 로그인 (AuthContext)
- **목적**: 사용자 인증
- **저장**: Context + 쿠키
- **사용**: 장바구니, 마이페이지 등

### 2. 통합회원 확인 (PasswordContext)
- **목적**: 특정 페이지 보호
- **저장**: HttpOnly 쿠키
- **사용**: 보호된 페이지 접근 시

---

## 🚀 개발 워크플로우

### 1. 로컬 개발
```bash
# 개발 서버 실행
pnpm dev

# 테스트 실행
pnpm test

# 빌드
pnpm build
```

### 2. Mock 데이터 수정
```bash
# db.json 파일 수정
vi src/api-mocks/db.json

# 서버 재시작 (자동 반영)
```

### 3. 새 페이지 추가
```bash
# 1. 페이지 생성
src/pages/new-page.tsx

# 2. Mock 데이터 추가 (필요시)
src/api-mocks/db.json

# 3. API 클라이언트 메서드 추가 (필요시)
src/lib/api-client.ts
```

---

## 📦 주요 의존성

```json
{
  "dependencies": {
    "next": "14.2.33",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@tanstack/react-query": "^5.62.11",
    "react-hook-form": "^7.54.2",
    "zod": "^3.24.1",
    "js-cookie": "^3.0.5"
  },
  "devDependencies": {
    "typescript": "5.7.3",
    "@types/react": "18.3.18",
    "tailwindcss": "3.4.17",
    "jest": "^30.2.0",
    "@testing-library/react": "^16.1.0"
  }
}
```

---

## 🎯 학습 목표

### 페이지별 학습 포인트
- **로그인**: React Hook Form + Zod 검증
- **상품 목록**: 무한 스크롤 + IntersectionObserver
- **장바구니**: Optimistic Updates + 롤백
- **검색**: Debouncing + localStorage
- **마이페이지**: 인증 가드 + 프로필 수정

---

## 🔧 환경 변수

**파일**: `.env.local`

```env
# 사이트 비밀번호
NEXT_PUBLIC_SITE_PASSWORD=demo1234

# API URL (실제 배포 시)
# NEXT_PUBLIC_API_URL=https://api.example.com
```

---

## 📝 개발 가이드라인

### 1. API 호출 패턴
```typescript
// ✅ 권장: React Query 사용
const { data, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: () => apiClient.get('products')
});

// ❌ 비권장: 직접 fetch
fetch('/api/products')
```

### 2. 상태 관리
```typescript
// 서버 상태 → React Query
// 전역 상태 → Context
// 로컬 상태 → useState
```

### 3. 타입 정의
```typescript
// 인터페이스 정의 필수
interface Product {
  id: number;
  name: string;
  price: number;
}
```

---

## 🐛 디버깅

### Mock API 확인
```typescript
// api-client.ts에 로그 추가
console.log('API Call:', endpoint, data);
```

### React Query DevTools
```typescript
// _app.tsx에 추가
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
```

---

## 📚 참고 문서

- **Next.js 공식 문서**: https://nextjs.org/docs
- **React Query 문서**: https://tanstack.com/query
- **Tailwind CSS 문서**: https://tailwindcss.com/docs
- **프로젝트 가이드**:
  - `src/docs/AuthFlow.md` - 인증 플로우
  - `src/docs/ApiHandling.md` - API 처리
  - `src/docs/ProtectedRouteGuide.md` - 보호 라우팅

---

## 🤝 다른 AI에게 문의 시 참고사항

### 프로젝트 컨텍스트
```
- Next.js 14 (Pages Router) + TypeScript
- Mock API (JSON 파일 기반)
- 실제 백엔드는 Spring Boot (현재 미사용)
- 모바일 우선 디자인
- React Query로 상태 관리
```

### 주요 파일 위치
```
- API 클라이언트: src/lib/api-client.ts
- Mock 데이터: src/api-mocks/db.json
- 레이아웃: src/components/Layout.tsx
- 인증: src/context/AuthContext.tsx
```

### 일반적인 질문 예시
```
Q: "상품 목록 페이지에 필터 기능 추가하려면?"
A: src/pages/product/index.tsx 수정 + React Query 사용

Q: "새로운 Mock 데이터 추가하려면?"
A: src/api-mocks/db.json에 엔드포인트 추가

Q: "모바일 푸터 수정하려면?"
A: src/components/Footer.tsx 수정
```

---

## 🔄 업데이트 이력

- **2025-11-23**: 초기 프로젝트 설정
- **2025-11-23**: DP 예제 추가
- **2025-11-23**: Middleware 기반 보호 라우팅 추가
- **2025-11-23**: 프로젝트 스펙 문서 작성
