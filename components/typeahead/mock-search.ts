export type SearchResult = {
  id: string;
  label: string;
  subtitle: string;
  href: string;
  category: string;
  price: number;
};

export type SearchResponse = {
  query: string;
  count: number;
  results: SearchResult[];
  durationMs: number;
};

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  popularity: number;
  href: string;
  keywords: string[];
};

const PRODUCTS: Product[] = [
  { id: "p_001", name: "iPhone 16 Pro",        brand: "Apple",     category: "Phones",     price: 999,  popularity: 99, href: "/products/iphone-16-pro",    keywords: ["iphone", "apple", "ios", "smartphone"] },
  { id: "p_002", name: "iPhone 16",            brand: "Apple",     category: "Phones",     price: 799,  popularity: 94, href: "/products/iphone-16",        keywords: ["iphone", "apple", "ios", "phone"] },
  { id: "p_003", name: "Samsung Galaxy S25",   brand: "Samsung",   category: "Phones",     price: 899,  popularity: 91, href: "/products/galaxy-s25",       keywords: ["samsung", "galaxy", "android"] },
  { id: "p_004", name: "Google Pixel 10",      brand: "Google",    category: "Phones",     price: 849,  popularity: 88, href: "/products/pixel-10",         keywords: ["google", "pixel", "android"] },
  { id: "p_005", name: "MacBook Pro 14-inch",  brand: "Apple",     category: "Laptops",    price: 1999, popularity: 98, href: "/products/macbook-pro-14",   keywords: ["macbook", "apple", "laptop", "m4"] },
  { id: "p_006", name: "MacBook Air 13-inch",  brand: "Apple",     category: "Laptops",    price: 1099, popularity: 95, href: "/products/macbook-air-13",   keywords: ["macbook", "air", "apple", "laptop"] },
  { id: "p_007", name: "Dell XPS 13",          brand: "Dell",      category: "Laptops",    price: 1299, popularity: 82, href: "/products/dell-xps-13",      keywords: ["dell", "xps", "windows", "laptop"] },
  { id: "p_008", name: "Sony WH-1000XM6",      brand: "Sony",      category: "Headphones", price: 399,  popularity: 90, href: "/products/sony-wh1000xm6",   keywords: ["sony", "headphones", "noise"] },
  { id: "p_009", name: "AirPods Pro",          brand: "Apple",     category: "Headphones", price: 249,  popularity: 93, href: "/products/airpods-pro",      keywords: ["airpods", "apple", "earbuds"] },
  { id: "p_010", name: "Nintendo Switch 2",    brand: "Nintendo",  category: "Gaming",     price: 449,  popularity: 97, href: "/products/switch-2",         keywords: ["nintendo", "switch", "gaming"] },
  { id: "p_011", name: "PlayStation 5 Pro",    brand: "Sony",      category: "Gaming",     price: 699,  popularity: 92, href: "/products/ps5-pro",          keywords: ["playstation", "ps5", "sony"] },
  { id: "p_012", name: "Xbox Series X",        brand: "Microsoft", category: "Gaming",     price: 499,  popularity: 84, href: "/products/xbox-series-x",    keywords: ["xbox", "microsoft", "gaming"] },
];

const VARIANT_COUNT = 50;

// Inflate the base catalogue so the API can realistically return ~500 results
// and the client has something meaningful to virtualise against.
const EXPANDED: Product[] = (() => {
  const out: Product[] = [];
  for (const base of PRODUCTS) {
    out.push(base);
    for (let i = 1; i < VARIANT_COUNT; i++) {
      out.push({
        ...base,
        id: `${base.id}_v${i}`,
        name: `${base.name} · Variant ${i}`,
        href: `${base.href}-v${i}`,
        popularity: Math.max(0, base.popularity - i),
      });
    }
  }
  return out;
})();

const MAX_QUERY_LENGTH = 64;
const DEFAULT_LIMIT = 500;

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function scoreProduct(p: Product, query: string) {
  const q = query.toLowerCase();
  const name = p.name.toLowerCase();
  const brand = p.brand.toLowerCase();
  const category = p.category.toLowerCase();
  const keywords = p.keywords.join(" ").toLowerCase();

  let score = 0;
  if (name === q) score += 100;
  if (name.startsWith(q)) score += 80;
  if (name.includes(q)) score += 50;
  if (brand.startsWith(q)) score += 30;
  if (brand.includes(q)) score += 20;
  if (category.includes(q)) score += 15;
  if (keywords.includes(q)) score += 25;

  // Popularity is a tie-breaker, never a match signal — otherwise "no results"
  // becomes unreachable because every product has non-zero popularity.
  if (score === 0) return 0;
  score += p.popularity / 100;
  return score;
}

export async function mockSearch(rawQuery: string, signal: AbortSignal): Promise<SearchResponse> {
  const started = performance.now();
  const query = rawQuery.trim().replace(/\s+/g, " ").slice(0, MAX_QUERY_LENGTH);

  // Simulate an API that's usually fast but occasionally noticeably slow.
  // ~92% of requests in 50–250ms; ~8% in 500–800ms.
  const slow = Math.random() < 0.08;
  const delay = slow ? rand(500, 800) : rand(50, 250);

  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, delay);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        const err = new Error("Aborted");
        err.name = "AbortError";
        reject(err);
      },
      { once: true },
    );
  });

  if (!query) {
    return { query, count: 0, results: [], durationMs: Math.round(performance.now() - started) };
  }

  const results: SearchResult[] = EXPANDED.map((p) => ({ p, score: scoreProduct(p, query) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : b.p.popularity - a.p.popularity))
    .slice(0, DEFAULT_LIMIT)
    .map(({ p }) => ({
      id: p.id,
      label: p.name,
      subtitle: `${p.brand} · ${p.category}`,
      href: p.href,
      category: p.category,
      price: p.price,
    }));

  return { query, count: results.length, results, durationMs: Math.round(performance.now() - started) };
}
