# 1. 프로젝트 구조 및 개발 스펙

## 1.1. 개요
본 문서는 "은퇴한 용사의 마을(가제)" 게임 개발을 위한 기술 스택과 프로젝트 구조를 정의합니다.
웹 브라우저에서 동작하는 2D 턴제 게임이며, Google Gemini API를 활용한 AI Game Master가 핵심입니다.

## 1.2. 기술 스택 (Tech Stack)

### Core Engine & Runtime
- **Game Engine**: **Phaser 3** (v3.80+)
    - 이유: 강력한 2D 렌더링(WebGL/Canvas), 풍부한 생태계, 안티 그래버티 환경 친화적.
- **Language**: **TypeScript** (v5.x)
    - 이유: 정적 타입 분석을 통한 버그 방지 및 유지보수성 향상.
- **Bundler**: **Vite**
    - 이유: 빠른 HMR(Hot Module Replacement)로 개발 생산성 극대화.

### Backend & AI
- **Game Logic (Local Simulation)**:
    - **NPC Manager**: 각 NPC의 스케줄, 상태, 위치를 실시간(또는 턴 단위)으로 관리.
    - **Relationship Graph**: 인물 간의 관계도(친구, 원수, 가족 등)를 그래프 자료구조로 관리.
    - **Trait System**: '성격(Traits)'에 기반한 행동 로직 (예: '게으름' 특성은 작업 효율 저하 및 늦잠).
- **AI Integration (Optional for now)**:
    - 초기에는 로컬 로직으로 시뮬레이션하고, 복잡한 대화나 이벤트 생성 시에만 Gemini API 사용.

### 2.2. 핵심 데이터 구조 (Data Structures)

#### NPC Data Model
```typescript
interface NPC {
  id: string;
  name: string;
  stats: {
    strength: number; // 무력
    intelligence: number; // 지능
    charm: number; // 매력
  };
  traits: string[]; // ['greedy', 'brave', 'lazy']
  relationships: {
    [targetId: string]: {
      type: 'friend' | 'rival' | 'family' | 'romance';
      value: number; // -100 to 100
    };
  };
  schedule: {
    [time: string]: string; // "08:00": "open_shop"
  };
  currentAction: string;
}
```

## 1.3. 프로젝트 디렉토리 구조

```
/
├── public/                 # 정적 자산 (이미지, 사운드, 타일셋)
│   ├── assets/
│   ├── data/               # 맵 데이터 (JSON)
│   └── favicon.ico
├── src/
│   ├── assets/             # 로드할 자산 정의
│   ├── config/             # 게임 설정 (Phaser Config, 상수)
│   ├── entities/           # 게임 오브젝트 클래스
│   │   ├── Player.ts
│   │   ├── NPC.ts
│   │   └── Building.ts
│   ├── scenes/             # Phaser Scenes
│   │   ├── BootScene.ts    # 자산 로딩
│   │   ├── MainMenuScene.ts
│   │   ├── TownMapScene.ts # 메인 게임플레이
│   │   └── UIScene.ts      # HUD 및 대화창
│   ├── systems/            # 핵심 시스템 로직
│   │   ├── AIManager.ts    # Gemini 통신 담당
│   │   ├── TurnManager.ts  # 턴/시간 관리
│   │   └── EventBus.ts     # 씬 간 통신
│   ├── utils/              # 유틸리티 함수
│   └── main.ts             # 엔트리 포인트
├── docs/                   # 기획 문서
├── package.json
└── vite.config.ts
```

## 1.4. 명명 규칙 (Naming Convention)
- **파일/클래스**: PascalCase (예: `TurnManager.ts`, `class Player`)
- **변수/함수**: camelCase (예: `currentTurn`, `calculateDamage()`)
- **상수**: CONSTANT_CASE (예: `MAX_ACTION_POINTS`)
