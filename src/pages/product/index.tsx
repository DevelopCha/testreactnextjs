import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import Layout from "@/components/Layout";
import Link from "next/link";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useEffect } from "react";

export default function ProductListPage() {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ["products"],
        queryFn: ({ pageParam = 1 }) => apiClient.getProducts({ page: pageParam as number }),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    });

    const { elementRef, isIntersecting } = useIntersectionObserver({
        threshold: 1.0,
    });

    useEffect(() => {
        if (isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-8">Products</h1>

            {status === "pending" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-200 h-80 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : status === "error" ? (
                <div className="text-red-500">Error loading products</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {data?.pages.map((page) =>
                            page.data.map((product: any) => (
                                <Link key={product.id} href={`/product/${product.id}`} className="group">
                                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 transition-transform group-hover:-translate-y-1">
                                        <div className="aspect-[3/4] bg-gray-100 relative">
                                            {/* In real app use Next/Image */}
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {product.stock === 0 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">
                                                    SOLD OUT
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                                            <p className="text-gray-500 text-sm mb-2 capitalize">{product.category}</p>
                                            <p className="font-bold">{product.price.toLocaleString()} KRW</p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Infinite Scroll Trigger */}
                    <div ref={elementRef} className="h-20 flex items-center justify-center mt-8">
                        {isFetchingNextPage && (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        )}
                        {!hasNextPage && data && (
                            <p className="text-gray-500">No more products to load.</p>
                        )}
                    </div>
                </>
            )}
        </Layout>
    );
}
