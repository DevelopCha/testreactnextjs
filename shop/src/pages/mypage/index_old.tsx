import { useAuth, User } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";

export default function MyPage() {
    const { state } = useAuth();

    const { data: user, isLoading } = useQuery<User | undefined>({
        queryKey: ["user", state.user?.id],
        queryFn: () => apiClient.getById<User>("users", state.user!.id),
        enabled: !!state.user,
    });

    return (
        <AuthGuard>
            <Layout>
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">My Page</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Profile Card */}
                        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
                                    {user?.name?.[0]?.toUpperCase() || "U"}
                                </div>
                                <h2 className="text-xl font-semibold">{user?.name}</h2>
                                <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
                                <Link
                                    href="/mypage/edit"
                                    className="w-full py-2 px-4 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition-colors dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
                                >
                                    Edit Profile
                                </Link>
                            </div>
                        </div>

                        {/* Dashboard / Stats */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
                                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                                <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 dark:bg-zinc-800">
                                    No recent orders found.
                                </div>
                                <div className="mt-4 text-right">
                                    <Link href="/order/history" className="text-blue-600 text-sm hover:underline">
                                        View Order History →
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
                                <h3 className="text-lg font-semibold mb-4">Account Status</h3>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-800">
                                    <span className="text-gray-600 dark:text-gray-400">Membership Level</span>
                                    <span className="font-medium text-blue-600">Silver</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600 dark:text-gray-400">Points</span>
                                    <span className="font-medium">1,250 P</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </AuthGuard>
    );
}
