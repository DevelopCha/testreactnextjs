import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";

export default function OrderHistoryPage() {
    const { data: orders, isLoading } = useQuery({
        queryKey: ["orders"],
        queryFn: () => apiClient.get("orders"),
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">PAID</span>;
            case "shipping":
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">SHIPPING</span>;
            case "delivered":
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold">DELIVERED</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs font-bold">{status}</span>;
        }
    };

    return (
        <AuthGuard>
            <Layout>
                <h1 className="text-3xl font-bold mb-8">Order History</h1>

                {isLoading ? (
                    <div>Loading orders...</div>
                ) : !orders || orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
                        <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                        <Link href="/product" className="text-blue-600 hover:underline">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order: any) => (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
                                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center dark:bg-zinc-800 dark:border-zinc-700">
                                    <div>
                                        <span className="font-bold mr-4">Order #{order.id}</span>
                                        <span className="text-gray-500 text-sm">
                                            {new Date(order.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold">{order.totalAmount?.toLocaleString()} KRW</span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                </div>

                                <div className="p-4">
                                    {order.items.map((item: any, index: number) => (
                                        <div key={index} className="flex gap-4 py-4 border-b border-gray-100 last:border-0 dark:border-zinc-800">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{item.name}</h4>
                                                <p className="text-sm text-gray-500">
                                                    Option: {item.option} | Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="font-medium">
                                                {(item.price * item.quantity).toLocaleString()} KRW
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Layout>
        </AuthGuard>
    );
}
