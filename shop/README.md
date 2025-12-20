# Commerce-Lab

Next.js 기반의 이커머스 학습 프로젝트입니다. React와 Next.js의 실전 패턴을 배우기 위한 "살아있는 교과서" 역할을 합니다.

## 🚀 실행 방법

### 1. 개발 서버 실행

```bash
pnpm dev
```

개발 서버가 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 2. 프로덕션 빌드

```bash
pnpm build
```

### 3. 프로덕션 서버 실행

```bash
pnpm start
```

### 4. 테스트 실행

```bash
pnpm test
```

테스트를 watch 모드로 실행하려면:

```bash
pnpm test:watch
```

## 📋 주요 기능

- **인증 시스템**: 로그인, 회원가입, 비밀번호 재설정
- **상품 관리**: 상품 목록, 상세 페이지, 무한 스크롤
- **장바구니**: Optimistic Updates를 사용한 실시간 업데이트
- **주문**: 다단계 폼, 주문 내역
- **기타**: 검색, 이벤트, FAQ, 공지사항

## 🛠️ 기술 스택

- **프레임워크**: Next.js 14
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태 관리**: React Query (@tanstack/react-query)
- **폼 관리**: React Hook Form + Zod
- **테스트**: Jest + React Testing Library

## 📁 프로젝트 구조

```
src/
├── components/        # 재사용 가능한 컴포넌트
├── context/          # React Context (인증 등)
├── hooks/            # 커스텀 훅
├── lib/              # 유틸리티 및 API 클라이언트
├── pages/            # Next.js 페이지
│   ├── auth/         # 인증 관련 페이지
│   ├── cart/         # 장바구니
│   ├── checkout/     # 결제
│   ├── product/      # 상품
│   └── ...
└── styles/           # 전역 스타일

__tests__/            # 테스트 파일
```

## 📚 학습 포인트

각 페이지는 특정 학습 목표를 가지고 있으며, 해당 디렉토리의 `.md` 파일에 상세한 설명이 있습니다:

- **로그인** (`src/pages/auth/login/login.md`): React Hook Form, Zod 검증
- **장바구니** (`src/pages/cart/cart.md`): Optimistic Updates, 롤백 로직
- **상품 목록** (`src/pages/product/product-list.md`): 무한 스크롤, IntersectionObserver
- **상품 상세** (`src/pages/product/[id]/product-detail.md`): 동적 라우팅, useMemo
- **검색** (`src/pages/search/search.md`): Debouncing, localStorage

## 🧪 테스트

프로젝트에는 다음 페이지에 대한 단위 테스트가 포함되어 있습니다:

- Home 페이지
- Login 페이지
- Product List 페이지
- Product Detail 페이지
- Cart 페이지

테스트 파일은 `__tests__/` 디렉토리에 있습니다.

## 🔧 개발 팁

1. **Mock API**: 이 프로젝트는 `src/lib/api-client.ts`의 Mock API를 사용합니다.
2. **인증**: 기본 테스트 계정은 `user@example.com` / `password123!` 입니다.
3. **다크 모드**: Header의 토글 버튼으로 다크 모드를 전환할 수 있습니다.

## 📝 문서

- `src/docs/AuthFlow.md`: 인증 흐름 설명
- `src/docs/ApiHandling.md`: API 처리 방법
- 각 페이지 디렉토리의 `.md` 파일: 페이지별 구현 설명 (한국어)

## 🎯 다음 단계

이 프로젝트를 통해 다음을 학습할 수 있습니다:

1. Next.js의 다양한 렌더링 방법 (SSR, SSG, ISR)
2. React Query를 사용한 서버 상태 관리
3. React Hook Form과 Zod를 사용한 폼 검증
4. Optimistic Updates 패턴
5. 무한 스크롤 구현
6. TypeScript를 사용한 타입 안전성

## 📄 라이선스

이 프로젝트는 학습 목적으로 만들어졌습니다.
