import Layout from "@/components/Layout";
import Link from "next/link";

export default function NoticePage() {
    const notices = [
        { id: 1, title: "System Maintenance Notice", date: "2024-05-20", category: "System" },
        { id: 2, title: "Privacy Policy Update", date: "2024-05-15", category: "Policy" },
        { id: 3, title: "New Shipping Rates", date: "2024-05-01", category: "Service" },
    ];

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-8">Notice</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-zinc-800">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 w-24">Category</th>
                            <th className="p-4 font-semibold text-gray-600 dark:text-gray-400">Title</th>
                            <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 w-32 text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {notices.map((notice) => (
                            <tr key={notice.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="p-4 text-sm text-gray-500">{notice.category}</td>
                                <td className="p-4 font-medium cursor-pointer hover:text-blue-600 transition-colors">
                                    {notice.title}
                                </td>
                                <td className="p-4 text-sm text-gray-500 text-right">{notice.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}
