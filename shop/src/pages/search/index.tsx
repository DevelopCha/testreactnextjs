import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 500);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Load recent searches
    useEffect(() => {
        const saved = localStorage.getItem("recent_searches");
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Save recent search
    useEffect(() => {
        if (debouncedQuery && !recentSearches.includes(debouncedQuery)) {
            const newSearches = [debouncedQuery, ...recentSearches].slice(0, 5);
            setRecentSearches(newSearches);
            localStorage.setItem("recent_searches", JSON.stringify(newSearches));
        }
    }, [debouncedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

    const { data: results, isLoading } = useQuery({
        queryKey: ["search", debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery) return [];
            const allProducts = await apiClient.getProducts({ limit: 100 });
            return allProducts.data.filter((p: any) =>
                p.name.toLowerCase().includes(debouncedQuery.toLowerCase())
            );
        },
        enabled: !!debouncedQuery,
    });

    const clearHistory = () => {
        setRecentSearches([]);
        localStorage.removeItem("recent_searches");
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Search</h1>

                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full p-4 text-lg border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-zinc-900 dark:border-zinc-800"
                />

                {!query && recentSearches.length > 0 && (
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-gray-500 font-semibold">Recent Searches</h3>
                            <button onClick={clearHistory} className="text-sm text-red-500 hover:underline">
                                Clear All
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {recentSearches.map((term) => (
                                <button
                                    key={term}
                                    onClick={() => setQuery(term)}
                                    className="px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors dark:bg-zinc-800 dark:hover:bg-zinc-700"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8 space-y-4">
                    {isLoading ? (
                        <div>Searching...</div>
                    ) : results?.length === 0 ? (
                        <div className="text-center text-gray-500">No results found for "{debouncedQuery}"</div>
                    ) : (
                        results?.map((product: any) => (
                            <Link key={product.id} href={`/product/${product.id}`} className="block">
                                <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 transition-colors dark:bg-zinc-900 dark:border-zinc-800">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold">{product.name}</h3>
                                        <p className="text-gray-500 text-sm">{product.price.toLocaleString()} KRW</p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}
