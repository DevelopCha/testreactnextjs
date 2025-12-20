import Layout from "@/components/Layout";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";

type Event = {
    id: number;
    title: string;
    date: string;
    description: string;
    content: string;
};

export default function EventDetailPage({ event }: { event: Event }) {
    const router = useRouter();

    if (router.isFallback) {
        return <Layout><div>Loading event...</div></Layout>;
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold mb-4">
                    {new Date(event.date).toLocaleDateString()}
                </span>
                <h1 className="text-4xl font-bold mb-6">{event.title}</h1>
                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">{event.description}</p>
                    <div className="bg-gray-50 p-8 rounded-xl dark:bg-zinc-900">
                        {event.content}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

// Simulate Database
const EVENTS_DB = [
    { id: 1, title: "Summer Sale", date: "2024-06-01", description: "Up to 50% off on all summer items.", content: "Detailed content about Summer Sale..." },
    { id: 2, title: "New Collection Launch", date: "2024-06-15", description: "Be the first to see our new arrivals.", content: "Detailed content about New Collection..." },
    { id: 3, title: "Member Appreciation Day", date: "2024-07-01", description: "Double points for all purchases.", content: "Detailed content about Member Day..." },
];

export const getStaticPaths: GetStaticPaths = async () => {
    // Generate paths for all events
    const paths = EVENTS_DB.map((event) => ({
        params: { id: event.id.toString() },
    }));

    return {
        paths,
        fallback: true, // Enable fallback for new events not generated at build time
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const id = Number(params?.id);
    const event = EVENTS_DB.find((e) => e.id === id);

    if (!event) {
        return { notFound: true };
    }

    return {
        props: {
            event,
        },
        revalidate: 60, // ISR: Re-generate page every 60 seconds
    };
};
