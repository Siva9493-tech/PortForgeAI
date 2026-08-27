import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = readFileSync('.env', 'utf8');
const get = (k) => {
  const m = env.split(/\r?\n/).find((l) => l.trim().startsWith(k + '='));
  return m ? m.slice(m.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '') : undefined;
};
const url = get('PUBLIC_SUPABASE_URL');
const key = get('PUBLIC_SUPABASE_PUBLISHABLE_KEY');
console.log('url configured:', !!url, 'key configured:', !!key);
if (!url || !key) { console.log('MISSING ENV'); process.exit(1); }

const sb = createClient(url, key);
console.log('running listPublishedSlugs query (status=published, slug not null)...');
const listed = await sb.from('portfolios').select('slug').eq('status', 'published').not('slug', 'is', null);
console.log('listPublishedSlugs: error?', listed.error?.message ?? 'none', '| rows:', listed.data?.length ?? 'n/a');
console.log('slugs:', JSON.stringify(listed.data));

console.log('running getPublishedBySlug test for row 0...');
const s0 = listed.data?.[0]?.slug;
if (s0) {
  const one = await sb.from('portfolios').select('id,slug,status,title').eq('slug', s0).eq('status', 'published').maybeSingle();
  console.log('getPublishedBySlug: error?', one.error?.message ?? 'none', '| got?', !!one.data, '| status:', one.data?.status);
} else {
  console.log('no published slug rows to test getPublishedBySlug against');
}
console.log('minimal health query (count all portfolios, anon key):');
const all = await sb.from('portfolios').select('id', { count: 'exact', head: true });
console.log('count query: error?', all.error?.message ?? 'none', '| count:', all.count);
