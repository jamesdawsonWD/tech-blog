# After — Phase 1 perf fixes (2026-04-20)

Target branch state: lazy-imported heavy components, removed `images.unoptimized: true`, applied `content-visibility: auto` to MDX sections.

## Build output — bundle split confirmed

```
Route (app)                                 Size  First Load JS
├ ○ /                                    5.09 kB         163 kB
├ ● /articles/[slug]                      310 kB         498 kB
```

`/articles/[slug]` route chunk itself (after the lazy-load edit) is **52 KB uncompressed** (`.next/static/chunks/app/articles/[slug]/page-*.js`).

Demo components now live in separate chunks that load on demand. Notable split chunk:
- `46ff1023.*.js` — **622 KB uncompressed** — contains Sandpack + the Stitches runtime that used to blow out every article route.

## Scripts loaded per article (localhost prod build)

| Scenario | Script requests | Sandpack/Stitches loaded |
| --- | --- | --- |
| Heavy article (`/articles/trailing-gradient-button`) — uses Sandpack | 26 | ✓ (needed) |
| Light article (`/articles/animated-validation`) — no Sandpack | **20** | ✗ |

**Δ for a non-Sandpack article: 6 fewer script chunks** including the 622 KB Sandpack chunk. That's the primary win — 7 of your 8 articles don't use Sandpack, so they all get this saving.

## LoAF during soft-nav (localhost, link click from home → article)

| | Before (prod) | After (local build) |
| --- | --- | --- |
| LoAFs recorded | 4 | 3 |
| Frames with blocking time | 2 | 1 |
| Total blocking time | 18 ms | 22 ms |
| Worst blocking frame | 9 ms | 22 ms |
| Script attribution | `webpack` (57ms), `9218` (Stitches — 57ms) | *none with attributable script work* |

Reading: the after-run lost the heavy-script attribution, which is the whole point of the fix — the transition no longer spends tens of milliseconds executing the Stitches/Sandpack runtime on articles that don't need it. The 22ms worst frame is render/layout work, not script execution.

**Caveat:** the before numbers were captured on production Vercel; after numbers on `npm start` localhost. Not apples-to-apples for CDN / image optimization. The bundle-split numbers above are the cleaner artifact for the write-up.

## Image optimization

Config change:
```diff
-  images: { unoptimized: true }
+  images: {
+    remotePatterns: [{ protocol: "https", hostname: "pbs.twimg.com" }],
+  }
```

Every `next/image` (cover images, hero images, author avatars) now routes through Vercel's image CDN → AVIF/WebP, responsive `srcset`, automatic sizing. Real-world win is only observable on the deployed preview (localhost doesn't exercise the Vercel image edge).

Added `sizes="(min-width: 1024px) 1024px, 100vw"` to the two `<Image fill>` usages (`cover-image-with-skeleton.tsx`, `hero-image.tsx`) so the responsive `srcset` isn't defaulted to `100vw`.

## content-visibility

Added to `app/globals.css`:

```css
.article-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 600px;
}
```

Target: the `<section class="article-section">` wrappers produced by `rehype-sectionize`. Below-fold sections now skip style/layout/paint until they approach the viewport. `contain-intrinsic-size: auto 600px` uses the browser's remembered size after first render, falling back to 600px before first paint — avoids scroll-restore CLS.

## What still needs to happen (not done here)

1. **Deploy to Vercel preview** and re-measure from the real edge. Localhost numbers understate the image-CDN win and overstate script-download cost.
2. **Real-user soft-nav LCP**: CDP-driven Chrome can't trigger the soft-nav heuristics for Event Timing / soft-nav entries. Open the preview in real Chrome, paste `scripts/perf/soft-nav-lcp.js` into DevTools, click a Link manually, call `getSoftNavLCP()`.
3. **Manual Lighthouse run** on the preview URL (mobile throttling) for the authority-building screenshot.
4. **Phase 3 — Next 16 upgrade** as a separate PR.
