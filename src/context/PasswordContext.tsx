import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface PasswordContextType {
    isVerified: boolean;
    verify: (password: string) => boolean;
    logout: () => void;
}

const PasswordContext = createContext<PasswordContextType | undefined>(undefined);

const CORRECT_PASSWORD = process.env.NEXT_PUBLIC_SITE_PASSWORD || 'demo1234';
const COOKIE_NAME = 'sitePasswordVerified';

export function PasswordProvider({ children }: { children: ReactNode }) {
    const [isVerified, setIsVerified] = useState(false);

    // 초기 로드 시 쿠키 확인
    useEffect(() => {
        const verified = Cookies.get(COOKIE_NAME) === 'true';
        setIsVerified(verified);
    }, []);

    const verify = (password: string): boolean => {
        if (password === CORRECT_PASSWORD) {
            setIsVerified(true);
            Cookies.set(COOKIE_NAME, 'true', { expires: 1 }); // 1일 유효
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsVerified(false);
        Cookies.remove(COOKIE_NAME);
    };

    return (
        <PasswordContext.Provider value={{ isVerified, verify, logout }}>
            {children}
        </PasswordContext.Provider>
    );
}

export function usePassword() {
    const context = useContext(PasswordContext);
    if (!context) {
        throw new Error('usePassword must be used within PasswordProvider');
    }
    return context;
}
