# 개발 스펙 및 구조 가이드라인 (Development Specification & Guidelines)

## 1. 프로젝트 개요 (Project Overview)
**Anti-Gravity Viewer**는 로컬 파일 시스템의 이미지, 동영상, 압축 파일(ZIP/CBZ)을 관리하고 감상하기 위한 고성능 미디어 뷰어입니다. Electron 기반의 데스크탑 애플리케이션으로, 대용량 미디어 처리와 부드러운 사용자 경험을 중시합니다.

## 2. 기술 스택 (Tech Stack)

### Core
- **Framework**: Electron 31.0.0
- **Frontend**: React 19.0.0
- **Language**: TypeScript ~5.9.3
- **Bundler**: Vite 7.2.4

### Styling & UI
- **CSS Framework**: Tailwind CSS (v3)
- **Design System**: Custom Dark Mode Theme (`gray-900` base)

### Utilities
- **File System**: `fs/promises` (Node.js), `chokidar` (watching)
- **Archives**: `adm-zip` (ZIP/CBZ handling)
- **Bridge**: Electron IPC (Context Isolation Enabled)

## 3. 디렉토리 구조 (Directory Structure)

```
/
├── electron/               # Electron Main Process sources
│   ├── main.ts             # Entry point, IPC handlers, Protocol definition
│   └── preload.ts          # ContextBridge, API exposure
├── src/                    # Renderer Process (React) sources
│   ├── components/         # UI Components (Sidebar, FileList, MediaViewer)
│   ├── App.tsx             # Main App Layout & State Logic
│   ├── main.tsx            # React Entry
│   └── index.css           # Tailwind imports & Global styles
├── dist/                   # Built Renderer assets (Vite output)
├── dist-electron/          # Built Main assets (esbuild output)
└── package.json            # Dependencies & Scripts
```

## 4. 아키텍처 및 주요 로직 (Architecture & Key Logic)

### 4.1. Main Process (`electron/main.ts`)
Electron의 메인 프로세스는 시스템 레벨의 작업을 전담합니다.
- **Custom Protocol (`media://`)**: 로컬 파일 시스템 보안 제약을 우회하고 대용량 미디어를 스트리밍하기 위해 `media://` 프로토콜을 구현했습니다. Node.js Stream을 Web ReadableStream으로 변환하여 `Video/Image` 태그에 직접 공급합니다.
- **IPC Handlers**:
  - `get-files`: 지정된 디렉토리의 파일을 재귀적으로 탐색합니다.
  - `open-zip`: ZIP 파일을 임시 폴더(`.ag_zip_...`)에 압축 해제하고 내용을 반환합니다.
  - `batch-rename`: 안전한 일괄 이름 변경을 위해 임시 폴더 이동 -> 새 이름으로 복원 전략을 사용합니다.
  - `get-zip-cover`: ZIP 파일 내부의 첫 번째 이미지를 추출하여 캐싱 후 반환합니다.

### 4.2. Renderer Process (`src/App.tsx`)
React 기반의 프론트엔드는 사용자 인터랙션을 담당합니다.
- **State Management**: `useState`와 `localStorage`를 사용하여 현재 경로(`currentPath`)와 마지막 활성 폴더(`lastActiveFolder`)를 영구 저장합니다.
- **Components**:
  - `Sidebar`: 트리 구조의 폴더 네비게이션 및 일괄 작업(Batch Mode) 제어.
  - `FileList`: 평면적(Recursive Flat) 파일 목록 뷰 또는 일반 뷰 제공.
  - `MediaViewer`: 오버레이 형태의 미디어 감상 플레이어 (이전/다음 탐색 지원).

### 4.3. Data Flow
1. **User Action** (예: 폴더 열기) -> **React Component**
2. **IPC Invoke** (`window.electronAPI.openFolderDialog`) -> **Preload Bridge**
3. **Main Process Execution** (`dialog.showOpenDialog`) -> **Result Return**
4. **State Update** (`setCurrentPath`) -> **UI Re-render**

## 5. 상세 기능 명세 (Feature Specifications)

### 5.1. 미디어 프로토콜 (Media Protocol)
- **Scheme**: `media://<absolute_path>`
- **동작**:
  1. 클라이언트가 경로 요청.
  2. 메인 프로세스가 URL 디코딩 및 경로 정규화.
  3. MIME 타입 감지 (mp4, webm, jpg, png, etc.).
  4. Node Native Stream 생성 후 Web Response로 반환.
- **장점**: `file://` 프로토콜의 보안 경고 회피, 비디오 Seek 가능, 메모리 효율성.

### 5.2. ZIP / Comic Viewer
- **동작 방식**: 실시간 스트리밍 대신 **임시 압축 해제** 방식을 채택하여 빠른 탐색 속도 보장.
- **프로세스**: 
  1. ZIP 파일 클릭 -> `open-zip` IPC 호출.
  2. Main이 `.ag_zip_[hash]` 임시 폴더에 전체 압축 해제.
  3. 프론트엔드가 해당 임시 폴더를 루트로 네비게이션.
  4. 사용자는 일반 폴더처럼 이미지 감상.

### 5.3. 일괄 이름 변경 (Batch Rename)
- **안전성 확보**:
  - 파일 유실 방지를 위해 **Two-Phase Commit** 유사 방식 사용.
  - Phase 1: 원본 파일들을 `.ag_temp_batch` 폴더로 이동.
  - Phase 2: 임시 폴더에서 원래 위치로 **새 이름**을 부여하며 이동.
  - 실패 시: 에러 로그 출력 및 원자성 보장 노력 (Rollback은 현재 미구현이나 안전장치 존재).
- **네이밍 규칙**: `[Root]_[RelativePath]_[Sequence].ext` (예: `MyFolder_Sub_001.jpg`)

## 6. 개발 가이드라인 (Development Guidelines)

### 6.1. 코딩 컨벤션 (Conventions)
- **Path Handling**: Windows/Mac 호환성을 위해 항상 Node.js `path` 모듈을 사용합니다.
- **Async/Await**: 모든 파일 시스템 작업은 비동기(`fs.promises`)로 처리하여 UI 블로킹을 방지합니다.
- **Types**: `any` 사용을 지양하고 명시적인 인터페이스를 정의합니다.

### 6.2. 주의 사항 (Caveats)
- **Context Isolation**: Renderer에서 Node.js 모듈(`fs`, `path` 등)을 직접 사용할 수 없습니다. 반드시 `preload.ts`의 `electronAPI`를 통해야 합니다.
- **Security**: `webSecurity: false`는 개발 편의를 위해 설정되었으나, `media://` 프로토콜이 완성되었으므로 향후 활성화(`true`)를 권장합니다.

### 6.3. 빌드 및 실행 (Build & Run)
- **Dev Mode**: `npm run dev` (Concurrently runs Vite & Electron watch)
- **Build**: `npm run build` (tsc -> vite build -> electron build)
