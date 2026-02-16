import Header from "@/components/modules/Header";
import Hero from "@/components/modules/Hero";
import NewArrivals from "@/components/modules/NewArrivals";
import ShopByCategory from "@/components/modules/ShopByCategory";
import AboutSnippet from "@/components/modules/AboutSnippet";
import Footer from "@/components/modules/Footer";
import { getNewProducts, getCategories } from "@/lib/queries";

export const revalidate = 60; // revalidate every 60s

export default async function Home() {
  const [newProducts, categories] = await Promise.all([
    getNewProducts(),
    getCategories(),
  ]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <NewArrivals products={newProducts} />
        <ShopByCategory categories={categories} />
        <AboutSnippet />
      </main>
      <Footer />
    </>
  );
}
