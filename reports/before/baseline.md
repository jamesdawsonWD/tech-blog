# Baseline — Before perf work (2026-04-20)

**Target:** `https://www.jamesdawson.dev/articles/trailing-gradient-button` (heavy article — uses Sandpack + multiple demo components).

## Edge cache — healthy ✓

```
x-vercel-cache: HIT
age: 1649127   (~19 days)
cache-control: public, max-age=0, must-revalidate
```

Pages are fully static and cached at the edge. The "fetch every time" hypothesis was wrong — HTML arrives from cache instantly. **The slow-article feel is client-side (JS + images), not server/cache.**

## Lighthouse (mobile, navigation mode)

| Category | Score |
| --- | --- |
| Accessibility | 86 |
| Best Practices | 92 |
| SEO | 100 |
| Performance | *(not captured — `lighthouse_audit` CLI mode omits perf; covered by Core Web Vitals below)* |

Raw report: `reports/before/article-heavy-lighthouse.html`

## Main-thread cost during soft-nav transition

**Method:** load `/` in headed Chrome, inject LoAF observer, click `<Link>` to the heavy article (Next's client-side router handles the transition), read LoAF entries.

| Metric | Value |
| --- | --- |
| LoAF frames recorded | 4 |
| Frames with blocking time (>50ms) | 2 |
| Total blocking time | 18 ms |
| Worst single blocking frame | 9 ms |

**Top scripts by execution time during transition:**

| Invoker | Source | Duration | Count |
| --- | --- | --- | --- |
| `/_next/static/chunks/webpack-f8cadc8de9cd0bc1.js` | webpack runtime | 57 ms | 1 |
| `/_next/static/chunks/9218-b88b52366220a106.js` | Stitches / CSS-in-JS runtime (Sandpack dep) | 57 ms | 1 |
| `/` (home doc) | — | 8 ms | 1 |

The stitches chunk is pulled in by Sandpack, which is in the heavy article's bundle even if every article loads it.

## JS chunks loaded for an article route

**26 script chunks** were fetched across home + article nav. The Sandpack + Radix + Framer Motion dependencies are statically imported at the top of `app/articles/[slug]/page.tsx`, so every article bundle includes them even when not used. That's the #1 driver of slow-click perception.

## Images

`next.config.mjs` sets `images.unoptimized: true`. Consequence: no AVIF/WebP, no responsive `srcset`, full-resolution delivery for every cover image. Direct LCP hit on article hero images.

## Methodology notes & caveats

- **Soft-nav LCP could not be captured automatically** via chrome-devtools-mcp. Chrome's `SoftNavigationHeuristics` feature was enabled, but CDP-driven clicks don't generate Event Timing entries and Chrome's soft-nav heuristics didn't fire entries in this environment. Tracked as known gap for the write-up — **real user click-to-LCP will be measured post-fix via DevTools console with the user performing the click**.
- LoAF data is from a CDP-driven click; still representative of the main-thread blocking cost since the scripts execute regardless of who triggered the click.
- Hard-navigation LCP (direct URL load) also didn't fire in CDP-driven Chrome — unrelated to soft-nav. For hard-nav LCP we'll rely on Lighthouse in the "after" run plus manual devtools measurement.

## Expected wins from Phase 1

| Fix | Expected impact |
| --- | --- |
| Lazy-load Sandpack + demo components | Removes ~57ms stitches execution + chunk download from non-Sandpack articles. Big LCP win for articles without code demos. |
| Remove `images.unoptimized: true` | AVIF/WebP + responsive srcset → cover image payload drops ~60–80% → LCP drops proportionally |
| `content-visibility: auto` on home article cards + MDX sections | Reduces initial layout/paint work; small LCP/INP nudge |
| Delete dead Suspense on home | No perf impact. Tidiness. |
