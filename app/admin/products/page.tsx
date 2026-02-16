import { getProducts } from "@/lib/queries";
import AdminProductsContent from "@/components/modules/AdminProductsContent";

export const revalidate = 30;

export default async function ProductsPage() {
    const products = await getProducts();
    return <AdminProductsContent products={products} />;
}
