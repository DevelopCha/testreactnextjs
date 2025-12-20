# 비밀번호 보호 라우팅 시스템 구현 가이드 (Middleware 방식)

## 📋 개요

Next.js Middleware를 사용하여 특정 경로에 자동으로 비밀번호 보호를 적용하는 시스템입니다. 각 페이지에서 개별적으로 보호 컴포넌트를 감쌀 필요 없이, **라우터 레벨에서 자동으로 감지하고 리다이렉트**합니다.

---

## 🎯 Part 1: 개선된 아키텍처 및 플로우

### 1.1 전체 플로우

```
사용자가 /mypage 접근 시도
    ↓
[Middleware 실행]
    ↓
보호 경로 목록 확인 (/mypage, /order/*, /admin/* 등)
    ↓
쿠키에서 비밀번호 확인 여부 체크
    ↓
[미확인] → /verify?redirect=/mypage 로 리다이렉트
[확인됨] → 원래 페이지 렌더링
    ↓
/verify 페이지에서 비밀번호 입력
    ↓
[성공] → 쿠키 설정 + 원래 페이지로 리다이렉트
[실패] → 에러 메시지
```

### 1.2 핵심 차이점

#### ❌ 기존 방식 (컴포넌트 래핑)
```typescript
// 각 페이지마다 수동으로 감싸야 함
export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>콘텐츠</div>
    </ProtectedRoute>
  );
}
```

**단점**:
- 모든 보호 페이지마다 수동으로 래핑 필요
- 깜빡임 발생 (클라이언트에서 체크)
- 페이지별 관리 어려움

#### ✅ 개선 방식 (Middleware)
```typescript
// middleware.ts에서 자동 감지
export const config = {
  matcher: ['/mypage/:path*', '/order/:path*', '/admin/:path*']
};
```

**장점**:
- 중앙 집중식 관리
- 서버 레벨 체크 (깜빡임 없음)
- 보호 경로 목록만 관리하면 됨
- 실제 서비스에서 사용하는 방식

### 1.3 보호 경로 설정 전략

#### A. 명시적 경로 목록
```typescript
const PROTECTED_PATHS = [
  '/mypage',
  '/mypage/edit',
  '/order/history',
  '/order/result',
  '/admin',
  '/settings'
];
```

#### B. 패턴 매칭
```typescript
const PROTECTED_PATTERNS = [
  /^\/mypage/,      // /mypage로 시작하는 모든 경로
  /^\/order/,       // /order로 시작하는 모든 경로
  /^\/admin/,       // /admin으로 시작하는 모든 경로
];
```

#### C. 예외 경로 (보호 불필요)
```typescript
const PUBLIC_PATHS = [
  '/',
  '/product',
  '/notice',
  '/auth/login',
  '/auth/signup'
];
```

### 1.4 세션 저장 방식 비교

#### A. 클라이언트 쿠키 (현재 구현)
```typescript
// 장점: 구현 간단, 서버 부담 없음
// 단점: 보안 취약, 조작 가능
Cookies.set('passwordVerified', 'true');
```

#### B. HttpOnly 쿠키 (권장)
```typescript
// 장점: XSS 공격 방어, 클라이언트에서 접근 불가
// 단점: API 라우트 필요
res.setHeader('Set-Cookie', 'passwordVerified=true; HttpOnly; Secure; SameSite=Strict');
```

#### C. 서버 세션 (가장 안전)
```typescript
// 장점: 가장 안전, 서버에서 완전 제어
// 단점: 세션 스토어 필요 (Redis 등)
session.set('passwordVerified', true);
```

---

## 🛠️ Part 2: Middleware 기반 구현

### 2.1 프로젝트 구조

```
src/
├── middleware.ts                 # ⭐ 핵심: 라우팅 보호
├── pages/
│   ├── api/
│   │   ├── verify-password.ts   # 비밀번호 검증 API
│   │   └── logout-password.ts   # 로그아웃 API
│   └── verify.tsx                # 비밀번호 입력 페이지
└── lib/
    └── password-config.ts        # 보호 경로 설정
```

### 2.2 단계별 구현

#### Step 1: 보호 경로 설정 파일

**파일**: `src/lib/password-config.ts`

```typescript
// 비밀번호로 보호할 경로 목록
export const PROTECTED_PATHS = [
  '/mypage',
  '/mypage/edit',
  '/order/history',
  '/order/result',
  '/admin',
  '/settings',
  '/protected-example'
];

// 또는 패턴으로 정의
export const PROTECTED_PATTERNS = [
  /^\/mypage/,
  /^\/order/,
  /^\/admin/,
];

// 보호 경로인지 확인하는 헬퍼 함수
export function isProtectedPath(pathname: string): boolean {
  // 정확한 경로 매칭
  if (PROTECTED_PATHS.includes(pathname)) {
    return true;
  }
  
  // 패턴 매칭
  return PROTECTED_PATTERNS.some(pattern => pattern.test(pathname));
}

// 비밀번호 (실제로는 환경 변수 사용)
export const SITE_PASSWORD = process.env.SITE_PASSWORD || 'demo1234';
```

#### Step 2: Middleware 생성

**파일**: `middleware.ts` (프로젝트 루트)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProtectedPath } from './src/lib/password-config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. 보호 경로인지 확인
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }
  
  // 2. 쿠키에서 인증 상태 확인
  const isVerified = request.cookies.get('passwordVerified')?.value === 'true';
  
  // 3. 인증되지 않았으면 verify 페이지로 리다이렉트
  if (!isVerified) {
    const url = request.nextUrl.clone();
    url.pathname = '/verify';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // 4. 인증되었으면 통과
  return NextResponse.next();
}

// Middleware가 실행될 경로 설정
export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 경로에서 실행:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

#### Step 3: 비밀번호 검증 API (HttpOnly 쿠키 사용)

**파일**: `src/pages/api/verify-password.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { SITE_PASSWORD } from '@/lib/password-config';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { password } = req.body;

  // 비밀번호 검증
  if (password === SITE_PASSWORD) {
    // HttpOnly 쿠키 설정 (XSS 공격 방어)
    res.setHeader('Set-Cookie', [
      `passwordVerified=true; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24}` // 1일
    ]);
    
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ success: false, message: '비밀번호가 올바르지 않습니다.' });
}
```

#### Step 4: 로그아웃 API

**파일**: `src/pages/api/logout-password.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 쿠키 삭제
  res.setHeader('Set-Cookie', [
    'passwordVerified=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
  ]);

  return res.status(200).json({ success: true });
}
```

#### Step 5: 비밀번호 입력 페이지 (API 호출 방식)

**파일**: `src/pages/verify.tsx`

```typescript
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function VerifyPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirect = (router.query.redirect as string) || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // API로 비밀번호 검증 요청
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        // 성공: 원래 페이지로 리다이렉트
        router.push(redirect);
      } else {
        // 실패: 에러 메시지
        setError(data.message || '비밀번호가 올바르지 않습니다.');
        setPassword('');
      }
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg dark:bg-zinc-800">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold mb-2">비밀번호 확인</h1>
            <p className="text-gray-600 dark:text-gray-400">
              이 페이지에 접근하려면 비밀번호가 필요합니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-700 dark:border-zinc-600"
                placeholder="비밀번호를 입력하세요"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '확인 중...' : '확인'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-500 mb-2">데모 비밀번호:</div>
            <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono dark:bg-zinc-700">
              demo1234
            </code>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

#### Step 6: 로그아웃 버튼 (보호된 페이지에서)

```typescript
const handleLogout = async () => {
  await fetch('/api/logout-password', { method: 'POST' });
  router.push('/verify');
};

<button onClick={handleLogout}>
  비밀번호 로그아웃
</button>
```

### 2.3 환경 변수 설정

**파일**: `.env.local`

```env
SITE_PASSWORD=your_secure_password_here
```

---

## 🔒 보안 강화 방안

### 1. Rate Limiting (무차별 대입 공격 방어)

```typescript
// src/lib/rate-limit.ts
const attempts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);
  
  if (!record || now > record.resetTime) {
    attempts.set(ip, { count: 1, resetTime: now + 60000 }); // 1분
    return true;
  }
  
  if (record.count >= 5) {
    return false; // 1분에 5회 초과
  }
  
  record.count++;
  return true;
}
```

### 2. CSRF 토큰

```typescript
// API 라우트에서
import { getCsrfToken } from 'next-auth/csrf';

// 검증
if (req.headers['x-csrf-token'] !== expectedToken) {
  return res.status(403).json({ message: 'Invalid CSRF token' });
}
```

### 3. 비밀번호 해싱 (서버 세션 사용 시)

```typescript
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

---

## 📊 방식 비교표

| 항목 | 컴포넌트 방식 | Middleware 방식 |
|------|--------------|----------------|
| 구현 복잡도 | 낮음 | 중간 |
| 관리 편의성 | 낮음 (각 페이지) | 높음 (중앙 관리) |
| 깜빡임 | 있음 | 없음 |
| SEO | 불리 | 유리 |
| 보안성 | 낮음 | 높음 |
| 실무 적합성 | 낮음 | 높음 |

---

## 🎯 실전 활용 예시

### 1. 페이지별 다른 비밀번호

```typescript
// password-config.ts
export const PAGE_PASSWORDS = {
  '/admin': 'admin123',
  '/mypage': 'user123',
  '/order': 'order123',
};

// middleware.ts
const requiredPassword = PAGE_PASSWORDS[pathname];
const userPassword = request.cookies.get(`password_${pathname}`)?.value;
```

### 2. 시간 제한

```typescript
// 1시간 후 자동 만료
res.setHeader('Set-Cookie', [
  `passwordVerified=true; Path=/; HttpOnly; Max-Age=3600`
]);
```

### 3. IP 기반 제한

```typescript
const allowedIPs = ['127.0.0.1', '192.168.1.1'];
const clientIP = request.ip;

if (!allowedIPs.includes(clientIP)) {
  return NextResponse.redirect('/verify');
}
```

---

## 📚 참고 자료

- [Next.js Middleware 공식 문서](https://nextjs.org/docs/advanced-features/middleware)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [HttpOnly Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [OWASP 보안 가이드](https://owasp.org/www-project-web-security-testing-guide/)

---

## ✅ 체크리스트

- [ ] `middleware.ts` 파일 생성
- [ ] `password-config.ts`에 보호 경로 정의
- [ ] `/api/verify-password` API 생성
- [ ] `/api/logout-password` API 생성
- [ ] `/verify` 페이지를 API 호출 방식으로 수정
- [ ] HttpOnly 쿠키 설정 확인
- [ ] Rate Limiting 구현 (선택)
- [ ] 환경 변수 설정
- [ ] 테스트: 보호 경로 접근 → 리다이렉트 → 비밀번호 입력 → 원래 페이지
