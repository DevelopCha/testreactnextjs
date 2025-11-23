import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { state } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!state.isLoading && !state.isAuthenticated) {
            router.push(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`);
        }
    }, [state.isLoading, state.isAuthenticated, router]);

    if (state.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-lg animate-pulse">Checking Authentication...</div>
            </div>
        );
    }

    if (!state.isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
