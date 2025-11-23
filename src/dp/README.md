# Dynamic Programming 예제 모음

이 폴더는 다양한 동적 프로그래밍(DP) 문제와 해결 방법을 담고 있습니다.

## 📚 포함된 예제

### 1. 피보나치 수열 (Fibonacci Sequence)
**문제**: n번째 피보나치 수를 구하기
**시간 복잡도**: O(n)
**공간 복잡도**: O(n)

```typescript
fibonacci(10) // 55
```

**핵심 개념**: 메모이제이션을 사용한 Top-Down 방식

### 2. 배낭 문제 (0/1 Knapsack Problem)
**문제**: 주어진 무게 제한 내에서 최대 가치를 얻기
**시간 복잡도**: O(n * capacity)
**공간 복잡도**: O(n * capacity)

```typescript
const weights = [1, 2, 3];
const values = [6, 10, 12];
const capacity = 5;
knapsack(weights, values, capacity) // 22
```

**핵심 개념**: 2D DP 테이블, Bottom-Up 방식

### 3. 최장 증가 부분 수열 (Longest Increasing Subsequence)
**문제**: 가장 긴 증가하는 부분 수열의 길이 구하기
**시간 복잡도**: O(n²)
**공간 복잡도**: O(n)

```typescript
longestIncreasingSubsequence([10, 9, 2, 5, 3, 7, 101, 18]) // 4
```

**핵심 개념**: 1D DP 배열, 각 위치에서의 최대 길이 저장

### 4. 동전 교환 문제 (Coin Change)
**문제**: 주어진 금액을 만들기 위한 최소 동전 개수
**시간 복잡도**: O(amount * coins.length)
**공간 복잡도**: O(amount)

```typescript
coinChange([1, 2, 5], 11) // 3 (5 + 5 + 1)
```

**핵심 개념**: 1D DP 배열, 각 금액별 최소 동전 개수

### 5. 최소 경로 합 (Minimum Path Sum)
**문제**: 그리드에서 왼쪽 위에서 오른쪽 아래까지의 최소 경로 합
**시간 복잡도**: O(m * n)
**공간 복잡도**: O(m * n)

```typescript
const grid = [
  [1, 3, 1],
  [1, 5, 1],
  [4, 2, 1]
];
minPathSum(grid) // 7 (1→3→1→1→1)
```

**핵심 개념**: 2D DP 테이블, 이전 경로의 최소값 활용

## 🎯 DP 학습 포인트

### 1. 메모이제이션 (Memoization)
- Top-Down 방식
- 재귀 + 캐싱
- 필요한 부분만 계산

### 2. 타뷸레이션 (Tabulation)
- Bottom-Up 방식
- 반복문 사용
- 모든 부분 문제 해결

### 3. 상태 정의
- `dp[i]`: i번째 위치에서의 최적해
- `dp[i][j]`: 두 가지 변수를 고려한 최적해

### 4. 점화식 도출
- 부분 문제 간의 관계 파악
- 이전 상태로부터 현재 상태 계산

## 💡 사용 방법

```typescript
import { fibonacci, knapsack, longestIncreasingSubsequence } from '@/dp/examples';

// 피보나치 수열
const fib10 = fibonacci(10);

// 배낭 문제
const maxValue = knapsack([1, 2, 3], [6, 10, 12], 5);

// 최장 증가 부분 수열
const lisLength = longestIncreasingSubsequence([10, 9, 2, 5, 3, 7]);
```

## 📖 추가 학습 자료

- **시간 복잡도 최적화**: 일부 문제는 공간 복잡도를 O(1)로 줄일 수 있습니다
- **역추적 (Backtracking)**: DP 테이블에서 실제 해를 구하는 방법
- **상태 압축**: 비트마스킹을 활용한 DP

## 🔗 관련 문제

- LeetCode DP 문제집
- 백준 DP 단계별 문제
- 프로그래머스 DP 연습 문제
