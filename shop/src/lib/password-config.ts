// 비밀번호로 보호할 경로 목록
export const PROTECTED_PATHS = [
    '/mypage',
    '/mypage/edit',
    '/order/history',
    '/order/result',
    '/protected-example'
];

// 패턴으로 보호할 경로
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

// 비밀번호 (환경 변수 사용)
export const SITE_PASSWORD = process.env.SITE_PASSWORD || 'demo1234';
