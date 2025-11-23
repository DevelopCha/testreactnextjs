import Layout from "@/components/Layout";
import Link from "next/link";
import { GetServerSideProps } from "next";

type Event = {
    id: number;
    title: string;
    date: string;
    description: string;
};

export default function EventsListPage({ events }: { events: Event[] }) {
    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-8">Upcoming Events (SSR)</h1>
            <div className="grid gap-6">
                {events.map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`} className="block">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 transition-colors dark:bg-zinc-900 dark:border-zinc-800">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                                    <p className="text-gray-600 dark:text-gray-400">{event.description}</p>
                                </div>
                                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                                    {new Date(event.date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </Layout>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const events = [
        { id: 1, title: "Summer Sale", date: "2024-06-01", description: "Up to 50% off on all summer items." },
        { id: 2, title: "New Collection Launch", date: "2024-06-15", description: "Be the first to see our new arrivals." },
        { id: 3, title: "Member Appreciation Day", date: "2024-07-01", description: "Double points for all purchases." },
    ];

    return {
        props: {
            events,
        },
    };
};
