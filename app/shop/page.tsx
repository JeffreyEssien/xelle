import { Suspense } from "react";
import Header from "@/components/modules/Header";
import Footer from "@/components/modules/Footer";
import { getProducts, getCategories } from "@/lib/queries";
import ShopContent from "@/components/modules/ShopContent";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
    const [products, categories] = await Promise.all([
        getProducts(),
        getCategories(),
    ]);

    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-6 pt-6 pb-16">
                <Suspense>
                    <ShopContent products={products} categories={categories} />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
