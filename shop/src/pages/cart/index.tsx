import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";

export default function CartPage() {
    const queryClient = useQueryClient();

    // Fetch Cart
    const { data: cartItems, isLoading } = useQuery({
        queryKey: ["cart"],
        queryFn: () => apiClient.get("cart"),
    });

    // Optimistic Update Mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
            apiClient.updateCartItem(id, quantity),
        onMutate: async ({ id, quantity }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["cart"] });

            // Snapshot previous value
            const previousCart = queryClient.getQueryData(["cart"]);

            // Optimistically update
            queryClient.setQueryData(["cart"], (old: any[]) =>
                old.map((item) =>
                    item.id === id ? { ...item, quantity } : item
                )
            );

            return { previousCart };
        },
        onError: (err, newTodo, context) => {
            // Rollback on error
            queryClient.setQueryData(["cart"], context?.previousCart);
        },
        onSettled: () => {
            // Refetch to ensure sync
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });

    const removeMutation = useMutation({
        mutationFn: (id: number) => apiClient.removeCartItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });

    const totalAmount = cartItems?.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
    );

    return (
        <AuthGuard>
            <Layout>
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

                {isLoading ? (
                    <div>Loading cart...</div>
                ) : !cartItems || cartItems.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 mb-4">Your cart is empty.</p>
                        <Link href="/product" className="text-blue-600 hover:underline">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800"
                                >
                                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0" />
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-semibold">{item.name}</h3>
                                            <p className="text-sm text-gray-500">Option: {item.option}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        updateMutation.mutate({
                                                            id: item.id,
                                                            quantity: Math.max(1, item.quantity - 1),
                                                        })
                                                    }
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() =>
                                                        updateMutation.mutate({
                                                            id: item.id,
                                                            quantity: item.quantity + 1,
                                                        })
                                                    }
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="font-bold">
                                                {(item.price * item.quantity).toLocaleString()} KRW
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeMutation.mutate(item.id)}
                                        className="text-gray-400 hover:text-red-500 self-start"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 sticky top-24">
                                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>{totalAmount?.toLocaleString()} KRW</span>
                                </div>
                                <div className="flex justify-between mb-4">
                                    <span className="text-gray-600">Shipping</span>
                                    <span>3,000 KRW</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between font-bold text-lg mb-6">
                                    <span>Total</span>
                                    <span>{((totalAmount || 0) + 3000).toLocaleString()} KRW</span>
                                </div>
                                <Link
                                    href="/checkout"
                                    className="block w-full py-3 bg-blue-600 text-white text-center font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Proceed to Checkout
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </Layout>
        </AuthGuard>
    );
}
