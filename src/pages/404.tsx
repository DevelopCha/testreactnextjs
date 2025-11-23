import Layout from "@/components/Layout";
import Link from "next/link";

export default function Custom404() {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h1 className="text-9xl font-bold text-gray-200 dark:text-zinc-800">404</h1>
                <h2 className="text-3xl font-bold mt-4 mb-6">Page Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-md">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link
                    href="/"
                    className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors"
                >
                    Go Home
                </Link>
            </div>
        </Layout>
    );
}
