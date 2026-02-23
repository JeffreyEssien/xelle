import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data: p } = await supabase.from('products').select('*');
  const { data: c } = await supabase.from('categories').select('*');
  console.log(`Found ${p?.length || 0} products and ${c?.length || 0} categories.`);

  if (p) {
    p.forEach(x => console.log(`- ${x.name} (${x.category})`));
  }
}
run();
