# 검색 페이지 구현

## 🎯 학습 목표
- **디바운싱**: 모든 키 입력 시 API 호출을 방지하기 위해 커스텀 `useDebounce` 훅 사용.
- **LocalStorage**: 클라이언트 측에서 최근 검색어 유지.
- **파생 상태**: 사용자 입력과 기록을 결합하여 관련 UI 표시(기록 vs 결과).

## 🛠️ 구현 로직
1. **입력**: `query` 상태를 즉시 업데이트합니다.
2. **디바운스**: `useDebounce`는 `debouncedQuery`를 업데이트하기 전에 500ms를 기다립니다.
3. **쿼리**: `useQuery`는 `debouncedQuery`가 변경될 때만 트리거됩니다.
4. **기록**: `useEffect`는 `debouncedQuery`를 감시하고 새로운 경우 `localStorage`에 추가합니다.

## 💡 팁
- 디바운싱은 검색 입력의 성능과 UX에 매우 중요합니다.
- `localStorage` 액세스는 SSR 하이드레이션 불일치를 피하기 위해 항상 `useEffect` 또는 `window` 확인으로 감싸야 합니다.
