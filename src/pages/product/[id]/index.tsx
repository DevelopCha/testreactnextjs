import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import Layout from "@/components/Layout";
import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
    options?: string[];
    stock: number;
}

export default function ProductDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const { state } = useAuth();

    const { data: product, isLoading } = useQuery<Product | undefined>({
        queryKey: ["product", id],
        queryFn: () => apiClient.getById<Product>("products", Number(id)),
        enabled: !!id,
    });

    const [selectedOption, setSelectedOption] = useState<string>("");
    const [quantity, setQuantity] = useState(1);

    // Price calculation logic
    const totalPrice = useMemo(() => {
        if (!product) return 0;
        let base = product.price;
        // Simulate price modifier for 'XL' or 'L'
        if (selectedOption === "XL") base += 2000;
        if (selectedOption === "L") base += 1000;
        return base * quantity;
    }, [product, selectedOption, quantity]);

    const addToCart = async () => {
        if (!state.isAuthenticated) {
            alert("Please login first");
            router.push(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`);
            return;
        }

        if (!selectedOption && product?.options?.length) {
            alert("Please select an option");
            return;
        }

        // Simulate API call
        await apiClient.post("cart", {
            productId: product?.id,
            name: product?.name,
            price: totalPrice / quantity, // Unit price
            quantity,
            option: selectedOption,
        });

        alert("Added to cart!");
    };

    if (isLoading) return <Layout><div>Loading...</div></Layout>;
    if (!product) return <Layout><div>Product not found</div></Layout>;

    return (
        <Layout>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="bg-gray-100 rounded-xl aspect-square relative overflow-hidden">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Info Section */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                        <p className="text-gray-500 capitalize">{product.category}</p>
                    </div>

                    <div className="text-2xl font-bold">
                        {totalPrice.toLocaleString()} KRW
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Option</label>
                            <div className="flex flex-wrap gap-2">
                                {product.options?.map((opt: string) => (
                                    <button
                                        key={opt}
                                        onClick={() => setSelectedOption(opt)}
                                        className={`px-4 py-2 rounded-lg border transition-all ${selectedOption === opt
                                            ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                            : "border-gray-200 hover:border-gray-300 dark:border-zinc-700"
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Quantity</label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                    -
                                </button>
                                <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-zinc-800">
                        <button
                            onClick={addToCart}
                            disabled={product.stock === 0}
                            className="w-full py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {product.stock === 0 ? "SOLD OUT" : "Add to Cart"}
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
