import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function VerifyPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const redirect = (router.query.redirect as string) || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // API로 비밀번호 검증 요청
            const response = await fetch('/api/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (data.success) {
                // 성공: 원래 페이지로 리다이렉트
                router.push(redirect);
            } else {
                // 실패: 에러 메시지
                setError(data.message || '비밀번호가 올바르지 않습니다.');
                setPassword('');
            }
        } catch (err) {
            setError('오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
                <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg dark:bg-zinc-800">
                    <div className="text-center mb-6">
                        <div className="text-5xl mb-4">🔒</div>
                        <h1 className="text-2xl font-bold mb-2">비밀번호 확인</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            이 페이지에 접근하려면 비밀번호가 필요합니다.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                            요청 페이지: <code className="text-blue-600">{redirect}</code>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                비밀번호
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-700 dark:border-zinc-600"
                                placeholder="비밀번호를 입력하세요"
                                autoFocus
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !password}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? '확인 중...' : '확인'}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            💡 <strong>Middleware 방식</strong>
                        </div>
                        <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                            <li>• 라우터 레벨에서 자동 감지</li>
                            <li>• HttpOnly 쿠키로 보안 강화</li>
                            <li>• 서버 측 검증</li>
                        </ul>
                    </div>

                    <div className="mt-4 text-center">
                        <div className="text-sm text-gray-500 mb-2">데모 비밀번호:</div>
                        <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono dark:bg-zinc-700">
                            demo1234
                        </code>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
