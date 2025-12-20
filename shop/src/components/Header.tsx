import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
    const { state, logout } = useAuth();

    return (
        <header className="flex items-center justify-between p-4 bg-white shadow-md dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
            <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                Commerce-Lab
            </Link>
            <nav className="flex gap-6 items-center">
                <Link href="/product" className="hover:text-blue-500 transition-colors">
                    Products
                </Link>
                <Link href="/notice" className="hover:text-blue-500 transition-colors">
                    Notice
                </Link>
                <Link href="/protected-example" className="hover:text-blue-500 transition-colors">
                    🔒 Protected
                </Link>
                {state.isAuthenticated ? (
                    <>
                        <Link href="/cart" className="hover:text-blue-500 transition-colors">
                            Cart
                        </Link>
                        <Link href="/mypage" className="hover:text-blue-500 transition-colors">
                            My Page
                        </Link>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <div className="flex gap-2">
                        <Link
                            href="/auth/login"
                            className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            href="/auth/signup"
                            className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                        >
                            Sign Up
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    );
}
