import Layout from "@/components/Layout";
import { useState } from "react";

type FAQItem = {
    question: string;
    answer: string;
};

const faqs: FAQItem[] = [
    { question: "How long does shipping take?", answer: "Standard shipping takes 3-5 business days." },
    { question: "Can I return my order?", answer: "Yes, we accept returns within 30 days of purchase." },
    { question: "Do you ship internationally?", answer: "Currently, we only ship within South Korea." },
];

function AccordionItem({ item }: { item: FAQItem }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 dark:border-zinc-800">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 flex justify-between items-center text-left hover:text-blue-600 transition-colors"
            >
                <span className="font-medium text-lg">{item.question}</span>
                <span className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}>
                    ▼
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-40 opacity-100 pb-4" : "max-h-0 opacity-0"
                    }`}
            >
                <p className="text-gray-600 dark:text-gray-400">{item.answer}</p>
            </div>
        </div>
    );
}

export default function FAQPage() {
    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} item={faq} />
                    ))}
                </div>
            </div>
        </Layout>
    );
}
