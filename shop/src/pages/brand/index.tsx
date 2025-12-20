import Layout from "@/components/Layout";
import Image from "next/image";

export default function BrandPage() {
    return (
        <Layout>
            <div className="space-y-20">
                <section className="text-center space-y-6">
                    <h1 className="text-4xl font-bold">Our Brand Story</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        We believe in quality, sustainability, and transparency.
                    </p>
                </section>

                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                        {/* Using Next/Image for optimization */}
                        <Image
                            src="https://via.placeholder.com/800x800?text=Brand+Image"
                            alt="Our Workshop"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold">Craftsmanship</h2>
                        <p className="text-lg text-gray-600">
                            Every product is crafted with care in our local workshop. We source the finest materials
                            to ensure durability and comfort.
                        </p>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
