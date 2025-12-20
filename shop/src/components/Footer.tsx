import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
            {/* 데스크톱 푸터 */}
            <div className="hidden md:block">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-bold mb-4">고객센터</h3>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li><Link href="/faq" className="hover:text-blue-600">FAQ</Link></li>
                                <li><Link href="/notice" className="hover:text-blue-600">공지사항</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">쇼핑</h3>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li><Link href="/product" className="hover:text-blue-600">상품</Link></li>
                                <li><Link href="/brand" className="hover:text-blue-600">브랜드</Link></li>
                                <li><Link href="/events/list" className="hover:text-blue-600">이벤트</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">내 정보</h3>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li><Link href="/mypage" className="hover:text-blue-600">마이페이지</Link></li>
                                <li><Link href="/order/history" className="hover:text-blue-600">주문내역</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Commerce-Lab</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Next.js 학습 프로젝트
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-zinc-800 text-center text-sm text-gray-500">
                        © 2025 Commerce-Lab. All rights reserved.
                    </div>
                </div>
            </div>

            {/* 모바일 하단 네비게이션 (고정) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 z-50">
                <nav className="flex justify-around items-center h-16">
                    <Link href="/" className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-xs">홈</span>
                    </Link>

                    <Link href="/product" className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span className="text-xs">상품</span>
                    </Link>

                    <Link href="/search" className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-xs">검색</span>
                    </Link>

                    <Link href="/cart" className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-xs">장바구니</span>
                    </Link>

                    <Link href="/mypage" className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs">MY</span>
                    </Link>
                </nav>
            </div>

            {/* 모바일 하단 여백 (고정 네비게이션 공간 확보) */}
            <div className="md:hidden h-16"></div>
        </footer>
    );
}
