import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import Layout from "@/components/Layout";
import Link from "next/link";
import { useMemo } from "react";

export default function CategoryPage() {
    const router = useRouter();
    const { slug, sort } = router.query;

    const { data: products, isLoading } = useQuery({
        queryKey: ["products"], // In real app, query by category
        queryFn: () => apiClient.getProducts({ limit: 100 }), // Fetch all for client-side filtering
    });

    const filteredProducts = useMemo(() => {
        if (!products?.data) return [];

        let result = products.data.filter((p: any) => p.category === slug);

        if (sort === "price_asc") {
            result.sort((a: any, b: any) => a.price - b.price);
        } else if (sort === "price_desc") {
            result.sort((a: any, b: any) => b.price - a.price);
        }

        return result;
    }, [products, slug, sort]);

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.push({
            pathname: router.pathname,
            query: { ...router.query, sort: e.target.value },
        });
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold capitalize">{slug}</h1>

                <select
                    value={sort as string || ""}
                    onChange={handleSortChange}
                    className="p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                >
                    <option value="">Default</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                </select>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    No products found in this category.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {filteredProducts.map((product: any) => (
                        <Link key={product.id} href={`/product/${product.id}`} className="group">
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 transition-transform group-hover:-translate-y-1">
                                <div className="aspect-[3/4] bg-gray-100 relative">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                                    <p className="font-bold">{product.price.toLocaleString()} KRW</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </Layout>
    );
}
