# 제품 목록 페이지 구현

## 🎯 학습 목표
- **무한 스크롤**: `useInfiniteQuery`와 `IntersectionObserver`를 사용하여 무한 스크롤 구현.
- **커스텀 훅**: 사용자가 바닥으로 스크롤할 때 감지하는 `useIntersectionObserver` 생성.
- **그리드 레이아웃**: 제품 카드를 위한 반응형 그리드.
- **로딩 스켈레톤**: 초기 데이터가 로드되는 동안 펄스 애니메이션 표시.

## 🛠️ 구현 로직
1. **쿼리**: `useInfiniteQuery`는 제품 페이지를 가져옵니다. `getNextPageParam`은 더 많은 페이지가 있는지 결정합니다.
2. **관찰자**: 커스텀 훅은 목록 하단의 `div`를 감시합니다. 뷰포트에 들어오면(`isIntersecting`) `fetchNextPage`가 호출됩니다.
3. **UI**: `data.pages`(배열의 배열)를 매핑하여 로드된 모든 제품을 렌더링합니다.

## 💡 팁
- `useInfiniteQuery`는 "더 보기" 또는 무한 스크롤 패턴에 적합합니다.
- 초기 `isLoading`(또는 `status === 'pending'`) 상태와 구별하기 위해 항상 `isFetchingNextPage` 상태를 처리하여 하단에 스피너를 표시하세요.
