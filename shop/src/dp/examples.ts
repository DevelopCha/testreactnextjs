/**
 * Dynamic Programming 예제 모음
 * 
 * 이 폴더는 다양한 DP 문제와 해결 방법을 담고 있습니다.
 */

// 1. 피보나치 수열 (Fibonacci Sequence)
export function fibonacci(n: number): number {
    // 메모이제이션을 사용한 Top-Down 방식
    const memo: { [key: number]: number } = {};

    function fib(n: number): number {
        if (n <= 1) return n;
        if (memo[n]) return memo[n];

        memo[n] = fib(n - 1) + fib(n - 2);
        return memo[n];
    }

    return fib(n);
}

// 2. 배낭 문제 (0/1 Knapsack Problem)
export function knapsack(weights: number[], values: number[], capacity: number): number {
    const n = weights.length;
    const dp: number[][] = Array(n + 1).fill(0).map(() => Array(capacity + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= capacity; w++) {
            if (weights[i - 1] <= w) {
                dp[i][w] = Math.max(
                    values[i - 1] + dp[i - 1][w - weights[i - 1]],
                    dp[i - 1][w]
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    return dp[n][capacity];
}

// 3. 최장 증가 부분 수열 (Longest Increasing Subsequence)
export function longestIncreasingSubsequence(nums: number[]): number {
    if (nums.length === 0) return 0;

    const dp: number[] = Array(nums.length).fill(1);

    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
    }

    return Math.max(...dp);
}

// 4. 동전 교환 문제 (Coin Change)
export function coinChange(coins: number[], amount: number): number {
    const dp: number[] = Array(amount + 1).fill(Infinity);
    dp[0] = 0;

    for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
            if (i >= coin) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }

    return dp[amount] === Infinity ? -1 : dp[amount];
}

// 5. 최소 경로 합 (Minimum Path Sum)
export function minPathSum(grid: number[][]): number {
    const m = grid.length;
    const n = grid[0].length;
    const dp: number[][] = Array(m).fill(0).map(() => Array(n).fill(0));

    dp[0][0] = grid[0][0];

    // 첫 행 초기화
    for (let j = 1; j < n; j++) {
        dp[0][j] = dp[0][j - 1] + grid[0][j];
    }

    // 첫 열 초기화
    for (let i = 1; i < m; i++) {
        dp[i][0] = dp[i - 1][0] + grid[i][0];
    }

    // DP 테이블 채우기
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j];
        }
    }

    return dp[m - 1][n - 1];
}
