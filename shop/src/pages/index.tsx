import Layout from "@/components/Layout";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import Link from "next/link";

function FadeInSection({ children }: { children: React.ReactNode }) {
    const { elementRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

    return (
        <div
            ref={elementRef}
            className={`transition-all duration-1000 transform ${isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
        >
            {children}
        </div>
    );
}

export default function Home() {
    return (
        <Layout>
            <div className="space-y-32 py-20">
                {/* Hero Section */}
                <section className="text-center space-y-6">
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Commerce-Lab
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        A "Live Textbook" project demonstrating real-world React & Next.js patterns.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/product" className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors">
                            Explore Products
                        </Link>
                        <Link href="https://github.com" target="_blank" className="px-8 py-3 border border-gray-300 rounded-full font-bold hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
                            View Source
                        </Link>
                    </div>
                </section>

                {/* Feature 1 */}
                <FadeInSection>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="bg-gray-100 rounded-2xl aspect-video flex items-center justify-center text-4xl">
                            ⚡️
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold">Optimistic Updates</h2>
                            <p className="text-gray-600 text-lg">
                                Experience instant feedback with React Query's optimistic updates.
                                Modify cart quantities and see the UI update immediately before the server responds.
                            </p>
                            <Link href="/cart" className="text-blue-600 font-bold hover:underline">Try it in Cart →</Link>
                        </div>
                    </div>
                </FadeInSection>

                {/* Feature 2 */}
                <FadeInSection>
                    <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
                        <div className="space-y-4 md:order-1">
                            <h2 className="text-3xl font-bold">Complex Forms</h2>
                            <p className="text-gray-600 text-lg">
                                Master React Hook Form and Zod with multi-step checkout processes and real-time validation.
                            </p>
                            <Link href="/auth/signup" className="text-blue-600 font-bold hover:underline">Try Signup Validation →</Link>
                        </div>
                        <div className="bg-gray-100 rounded-2xl aspect-video flex items-center justify-center text-4xl md:order-2">
                            📝
                        </div>
                    </div>
                </FadeInSection>

                {/* Feature 3 */}
                <FadeInSection>
                    <div className="text-center space-y-8">
                        <h2 className="text-3xl font-bold">Ready to Learn?</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Dive into the source code to see how we implement Authentication, Infinite Scroll,
                            Dynamic Routing, and more.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                            {["Auth Flow", "Infinite Scroll", "Mock API", "Dark Mode"].map((item) => (
                                <div key={item} className="p-4 border rounded-xl font-semibold dark:border-zinc-800">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </FadeInSection>
            </div>
        </Layout>
    );
}
