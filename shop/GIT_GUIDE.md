# Git 커밋 가이드

## 🎯 커밋 전 체크리스트

### 1. .gitignore 확인
```bash
# .gitignore 파일이 있는지 확인
cat .gitignore
```

### 2. 커밋할 파일 확인
```bash
# 변경된 파일 확인
git status

# 추가할 파일 선택
git add .                    # 모든 파일
git add src/                 # 특정 폴더
git add package.json         # 특정 파일
```

### 3. 불필요한 파일 제외 확인
다음 파일들은 **절대 커밋하지 않기**:
- `node_modules/` - 의존성 (package.json으로 관리)
- `.next/` - 빌드 결과물
- `.env.local` - 환경 변수 (민감 정보)
- `*.log` - 로그 파일

---

## 📝 커밋 메시지 작성법

### 기본 형식
```
[타입] 제목 (50자 이내)

본문 (선택사항, 72자마다 줄바꿈)

Footer (선택사항)
```

### 타입 종류
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 설정, 패키지 등

### 예시

#### 1. 초기 커밋
```bash
git init
git add .
git commit -m "chore: 초기 프로젝트 설정

- Next.js 14 + TypeScript 설정
- Mock API 클라이언트 구현
- 기본 페이지 구조 (20개 페이지)
- 인증 시스템 (AuthContext)
- 비밀번호 보호 라우팅 (Middleware)
- 모바일 푸터 추가
- 단위 테스트 설정 (Jest + RTL)
- 한국어 문서화"
```

#### 2. 기능 추가
```bash
git commit -m "feat: 상품 필터링 기능 추가

- 카테고리별 필터
- 가격 범위 필터
- 검색어 필터
- URL 쿼리 파라미터 동기화"
```

#### 3. 버그 수정
```bash
git commit -m "fix: 장바구니 수량 업데이트 오류 수정

- Optimistic update 롤백 로직 개선
- 에러 처리 추가"
```

#### 4. 문서 수정
```bash
git commit -m "docs: README에 실행 방법 추가"
```

---

## 🚀 Git 초기 설정 및 첫 커밋

### 1. Git 초기화
```bash
cd c:\workspace
git init
```

### 2. 사용자 정보 설정 (최초 1회)
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 3. 첫 커밋
```bash
# 모든 파일 추가
git add .

# 커밋
git commit -m "chore: 초기 프로젝트 설정

Commerce-Lab Next.js 프로젝트 초기 구성
- Next.js 14 + TypeScript
- Mock API 시스템
- 20개 페이지 구현
- 인증 및 보호 라우팅
- 모바일 반응형 디자인
- 단위 테스트 (11개 통과)
- 완전한 한국어 문서화"
```

### 4. GitHub에 푸시 (선택)
```bash
# 원격 저장소 추가
git remote add origin https://github.com/username/commerce-lab.git

# 브랜치 이름 변경 (main으로)
git branch -M main

# 푸시
git push -u origin main
```

---

## 📊 현재 프로젝트 커밋할 파일 목록

### 핵심 파일
```
✅ package.json              # 의존성
✅ tsconfig.json             # TypeScript 설정
✅ next.config.js            # Next.js 설정
✅ tailwind.config.js        # Tailwind 설정
✅ jest.config.js            # Jest 설정
✅ middleware.ts             # Middleware
```

### 소스 코드
```
✅ src/
  ✅ components/            # 컴포넌트 (Header, Footer, Layout 등)
  ✅ context/               # Context (Auth, Password)
  ✅ hooks/                 # 커스텀 훅
  ✅ lib/                   # 유틸리티 (api-client, password-config)
  ✅ pages/                 # 페이지 (20개)
  ✅ api-mocks/             # Mock 데이터
  ✅ docs/                  # 문서
  ✅ dp/                    # DP 예제
  ✅ styles/                # 스타일
```

### 테스트
```
✅ __tests__/               # 테스트 파일 (5개)
✅ jest.setup.js            # Jest 설정
```

### 문서
```
✅ README.md                # 프로젝트 설명
✅ PROJECT_SPEC.md          # 프로젝트 스펙
✅ QUICKSTART.md            # 빠른 시작
✅ MIDDLEWARE_IMPLEMENTATION.md  # Middleware 구현
✅ src/docs/*.md            # 상세 가이드
✅ src/pages/**/*.md        # 페이지별 문서 (한국어)
```

### 제외할 파일 (.gitignore에 포함)
```
❌ node_modules/           # 의존성
❌ .next/                  # 빌드 결과
❌ .env.local              # 환경 변수
❌ *.log                   # 로그
```

---

## 💡 팁

### 1. 커밋 전 빌드 확인
```bash
pnpm build
pnpm test
```

### 2. 커밋 메시지 수정 (마지막 커밋)
```bash
git commit --amend -m "새로운 메시지"
```

### 3. 파일 제외하기
```bash
# 이미 추가된 파일 제거
git rm --cached filename

# .gitignore에 추가
echo "filename" >> .gitignore
```

### 4. 브랜치 전략 (선택)
```bash
# 기능 개발용 브랜치
git checkout -b feature/product-filter

# 작업 후 main에 병합
git checkout main
git merge feature/product-filter
```

---

## 🎯 Cursor AI에게 커밋 요청 시

다음과 같이 요청하면 됩니다:

```
"Git 커밋해줘. 
커밋 메시지는 'chore: 초기 프로젝트 설정'으로 하고,
본문에는 주요 기능들을 나열해줘."
```

또는:

```
"변경된 파일들을 확인하고 적절한 커밋 메시지로 커밋해줘."
```

Cursor가 자동으로:
1. `git status`로 변경 파일 확인
2. 적절한 커밋 메시지 생성
3. `git add` + `git commit` 실행

해줄 겁니다!
