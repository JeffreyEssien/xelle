import { notFound } from "next/navigation";
import Header from "@/components/modules/Header";
import Footer from "@/components/modules/Footer";
import ProductDetails from "@/components/modules/ProductDetails";
import ProductImageGallery from "@/components/modules/ProductImageGallery";
import YouMayAlsoLike from "@/components/modules/YouMayAlsoLike";
import { getProductBySlug, getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;
    const [product, allProducts] = await Promise.all([
        getProductBySlug(slug),
        getProducts(),
    ]);
    if (!product) return notFound();

    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-6 pt-4 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
                    <ProductImageGallery images={product.images} name={product.name} />
                    <ProductDetails product={product} />
                </div>
            </main>
            <YouMayAlsoLike currentProduct={product} allProducts={allProducts} />
            <Footer />
        </>
    );
}
