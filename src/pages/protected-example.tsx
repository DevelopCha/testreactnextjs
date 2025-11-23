import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ProtectedExamplePage() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/logout-password', { method: 'POST' });
        router.push('/verify');
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-12">
                <div className="bg-white rounded-xl shadow-lg p-8 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">🔐</div>
                        <h1 className="text-3xl font-bold mb-2">보호된 페이지</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Middleware로 자동 보호되는 페이지입니다.
                        </p>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg mb-8 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">✅</span>
                            <h2 className="font-semibold text-lg">접근 권한 확인됨</h2>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Middleware에서 자동으로 비밀번호를 확인하고 이 페이지로 리다이렉트했습니다.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-3">🎯 Middleware 방식의 장점</h3>
                            <div className="bg-blue-50 p-4 rounded-lg dark:bg-blue-900/20">
                                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-1">✓</span>
                                        <span><strong>중앙 집중식 관리</strong>: password-config.ts에서 보호 경로 목록만 관리</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-1">✓</span>
                                        <span><strong>서버 레벨 체크</strong>: 깜빡임 없이 서버에서 바로 리다이렉트</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-1">✓</span>
                                        <span><strong>HttpOnly 쿠키</strong>: XSS 공격으로부터 안전</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-1">✓</span>
                                        <span><strong>자동 감지</strong>: 각 페이지에서 래핑 불필요</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">📝 보호 경로 설정</h3>
                            <div className="bg-gray-50 p-4 rounded-lg dark:bg-zinc-800">
                                <pre className="text-sm overflow-x-auto">
                                    <code>{`// src/lib/password-config.ts
export const PROTECTED_PATHS = [
  '/mypage',
  '/mypage/edit',
  '/order/history',
  '/protected-example'
];`}</code>
                                </pre>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">🔗 관련 문서</h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 rounded-lg dark:bg-zinc-800">
                                    <span className="font-medium">📚 구현 가이드</span>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        src/docs/ProtectedRouteGuide.md
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-700 flex gap-4">
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                            🚪 로그아웃
                        </button>
                        <Link
                            href="/"
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600"
                        >
                            🏠 홈으로
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
