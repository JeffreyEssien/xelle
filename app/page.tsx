import Header from "@/components/modules/Header";
import Hero from "@/components/modules/Hero";
import NewArrivals from "@/components/modules/NewArrivals";
import ShopByCategory from "@/components/modules/ShopByCategory";
import AboutSnippet from "@/components/modules/AboutSnippet";
import Footer from "@/components/modules/Footer";
import { getNewProducts, getCategories, getSiteSettings, getMediaByIds } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [newProducts, categories, settings] = await Promise.all([
    getNewProducts(),
    getCategories(),
    getSiteSettings(),
  ]);

  // Resolve media IDs to URLs for the hero
  const displayConfig = settings?.heroDisplayConfig;
  const mediaIds = displayConfig?.mediaIds || [];
  const resolvedMedia = mediaIds.length > 0 ? await getMediaByIds(mediaIds) : [];

  // Resolve featured slide product images (already have URLs in the slides)
  const featuredSlides = settings?.featuredSlides || [];

  const heroEnabled = settings?.heroEnabled !== false; // default ON

  return (
    <>
      <Header />
      <main>
        {heroEnabled && (
          <Hero
            settings={settings}
            resolvedMedia={resolvedMedia}
            featuredSlides={featuredSlides}
          />
        )}
        <NewArrivals products={newProducts} />
        <ShopByCategory categories={categories} />
        <AboutSnippet />
      </main>
      <Footer />
    </>
  );
}
