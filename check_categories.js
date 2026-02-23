import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkCategories() {
    const { data: categories } = await supabase.from('categories').select('slug, name');
    const { data: products } = await supabase.from('products').select('name, category');

    const validSlugs = new Set(categories?.map(c => c.slug.toLowerCase().trim()));

    console.log("Valid Category Slugs:");
    categories?.forEach(c => console.log(`- ${c.slug}`));

    console.log("\nProducts with invalid/missing categories:");
    let foundMismatch = false;

    products?.forEach(p => {
        const prodCat = (p.category || "").toLowerCase().trim();
        if (!validSlugs.has(prodCat)) {
            foundMismatch = true;
            console.log(`- Product: "${p.name}", Category Assigned: "${p.category}"`);
        }
    });

    if (!foundMismatch) {
        console.log("✅ All products have valid category assignments!");
    }
}

checkCategories();
