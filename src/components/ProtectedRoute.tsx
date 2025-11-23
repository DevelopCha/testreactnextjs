import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { usePassword } from '@/context/PasswordContext';

interface ProtectedRouteProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const router = useRouter();
    const { isVerified } = usePassword();

    useEffect(() => {
        if (!isVerified) {
            // 현재 경로를 redirect 파라미터로 전달
            router.push(`/verify?redirect=${encodeURIComponent(router.asPath)}`);
        }
    }, [isVerified, router]);

    // 검증되지 않은 경우 fallback 또는 null 렌더링
    if (!isVerified) {
        return fallback ? <>{fallback}</> : null;
    }

    // 검증된 경우 children 렌더링
    return <>{children}</>;
}
