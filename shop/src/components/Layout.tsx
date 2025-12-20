import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-8 max-w-7xl pb-20 md:pb-4">
                {children}
            </main>
            <Footer />
        </div>
    );
}
