import { getProducts } from "@/lib/queries";
import AdminProductsContent from "@/components/modules/AdminProductsContent";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    const products = await getProducts();
    return <AdminProductsContent products={products} />;
}
