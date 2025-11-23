import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function OrderResultPage() {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Invalidate cart and orders to ensure fresh data
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
    }, [queryClient]);

    return (
        <Layout>
            <div className="max-w-md mx-auto mt-20 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 text-4xl">
                    ✓
                </div>
                <h1 className="text-3xl font-bold mb-4">Order Placed!</h1>
                <p className="text-gray-500 mb-8">
                    Thank you for your purchase. Your order has been successfully placed.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/order/history"
                        className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        View Order History
                    </Link>
                    <Link
                        href="/"
                        className="block w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </Layout>
    );
}
