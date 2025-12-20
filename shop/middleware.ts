import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProtectedPath } from './src/lib/password-config';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // /verify 페이지 자체는 체크하지 않음
    if (pathname === '/verify') {
        return NextResponse.next();
    }

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
