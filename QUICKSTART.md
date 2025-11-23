# 🚀 빠른 시작 가이드

## DP 예제 사용하기

### 위치
`src/dp/examples.ts`

### 사용 방법
```typescript
import { fibonacci, knapsack, longestIncreasingSubsequence } from '@/dp/examples';

// 피보나치 수열
const result = fibonacci(10); // 55

// 배낭 문제
const maxValue = knapsack([1, 2, 3], [6, 10, 12], 5); // 22

// 최장 증가 부분 수열
const length = longestIncreasingSubsequence([10, 9, 2, 5, 3, 7]); // 3
```

### 포함된 알고리즘
1. **피보나치 수열** - 메모이제이션
2. **배낭 문제** - 2D DP
3. **최장 증가 부분 수열** - 1D DP
4. **동전 교환** - 최소 개수 찾기
5. **최소 경로 합** - 그리드 탐색

자세한 설명은 `src/dp/README.md` 참고

---

## 비밀번호 보호 라우팅 사용하기

### 1. 보호된 페이지 확인

개발 서버 실행:
```bash
pnpm dev
```

브라우저에서 접속:
```
http://localhost:3000/protected-example
```

### 2. 플로우 확인

1. Header에서 "🔒 Protected" 클릭
2. `/verify` 페이지로 자동 리다이렉트
3. 비밀번호 입력: `demo1234`
4. 확인 버튼 클릭
5. `/protected-example` 페이지로 리다이렉트

### 3. 자신의 페이지 보호하기

```typescript
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <h1>보호된 콘텐츠</h1>
      </Layout>
    </ProtectedRoute>
  );
}
```

### 4. 비밀번호 변경

`.env.local` 파일 수정:
```env
NEXT_PUBLIC_SITE_PASSWORD=your_new_password
```

서버 재시작 필요!

---

## 📚 상세 문서

- **DP 알고리즘**: `src/dp/README.md`
- **보호 라우팅 가이드**: `src/docs/ProtectedRouteGuide.md`
  - Part 1: 라우팅 플로우 및 핵심 기능
  - Part 2: 상세 구현 가이드

---

## 🎯 주요 파일

### DP 예제
- `src/dp/examples.ts` - 알고리즘 구현
- `src/dp/README.md` - 설명 문서

### 보호 라우팅
- `src/context/PasswordContext.tsx` - 상태 관리
- `src/components/ProtectedRoute.tsx` - 보호 컴포넌트
- `src/pages/verify.tsx` - 비밀번호 확인 페이지
- `src/pages/protected-example.tsx` - 예제 페이지
- `src/docs/ProtectedRouteGuide.md` - 구현 가이드

---

## 💡 팁

### DP 예제
- 각 함수에 주석으로 시간/공간 복잡도 설명
- 실제 코딩 테스트에 바로 사용 가능
- TypeScript로 타입 안전성 보장

### 보호 라우팅
- 쿠키는 1일간 유효
- 로그아웃 버튼으로 초기화 가능
- 여러 페이지에 동일한 비밀번호 적용 가능
- 페이지별 다른 비밀번호 설정 가능 (가이드 참고)
