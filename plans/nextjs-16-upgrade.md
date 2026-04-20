# Next.js 15.2.8 → 16 Upgrade Plan

Target: bump to Next 16 + React 19.2 with near-zero churn. This repo is unusually clean for the upgrade — most breaking changes don't apply.

Source: [Next.js official upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16)

## Preflight — what's already v16-ready ✓

Checked against the v16 breaking-change list:

| Requirement | This repo | Status |
| --- | --- | --- |
| Node 20.9+ | v24.6.0 | ✓ |
| TypeScript 5.1+ | `^5` | ✓ |
| React 19.2 (Canary) | `^19` | ✓ |
| Async `params` / `searchParams` | already `Promise<{ slug: string }>` | ✓ |
| No custom `webpack` config | `next.config.mjs` has none | ✓ (Turbopack default fine) |
| No `middleware.ts` / rename to `proxy` | doesn't exist | ✓ |
| No parallel routes requiring `default.js` | not used | ✓ |
| No `revalidateTag` / `cacheLife` / `unstable_cache` | not used anywhere | ✓ |
| No `experimental_ppr` | not set | ✓ |
| No `experimental.dynamicIO` | not set | ✓ |
| No `next/legacy/image` | not used | ✓ |
| No AMP | not used | ✓ |
| No `serverRuntimeConfig` / `publicRuntimeConfig` | not used | ✓ |
| No `images.domains` (deprecated) | use `remotePatterns` already | ✓ |
| `images.unoptimized: true` removed | removed in earlier perf PR | ✓ |

## The actual upgrade

### 1. Run the codemod

```bash
npx @next/codemod@canary upgrade latest
```

Per the docs this will:
- Bump `next`, `react`, `react-dom` (+ `@types/react`, `@types/react-dom`) to latest.
- Move `experimental.turbopack` → top-level `turbopack` in `next.config.mjs`.
- Remove the `unstable_` prefix from any stabilized APIs (we don't use any, but harmless).
- Remove `experimental_ppr` from routes (we don't have any).
- Migrate `next lint` → ESLint CLI (see step 2).

Re-check `next.config.mjs` after the codemod for any config key rewrites. The only experimental flag we currently set is `viewTransition` — that's still supported in v16.

### 2. Replace `next lint` with the ESLint CLI

`next lint` is removed in v16. The codemod will offer the migration (`next-lint-to-eslint-cli`). If it doesn't run automatically:

```bash
npx @next/codemod@canary next-lint-to-eslint-cli .
```

After: `npm run lint` should call `eslint` directly. The ESLint flat-config format (`eslint.config.mjs`) is the v16 default — the codemod handles the conversion.

### 3. Confirm Turbopack builds

Next 16 makes Turbopack the default for both `next dev` and `next build`. Since we have no custom webpack config this should Just Work. But verify:

```bash
npm run build
```

- If it succeeds with the "using Turbopack" banner, we're done.
- If it fails complaining about a webpack plugin (usually something silently injecting config via PostHog/tailwind/etc), the escape hatch is `next build --webpack` — but first understand which plugin is misbehaving.

### 4. Verify image behaviour

v16 changes `images` defaults:
- `minimumCacheTTL`: 60s → 4h. **Good for us** — we removed `unoptimized` last pass and our cover images don't change often.
- `qualities`: only `[75]` allowed by default. We don't set explicit `quality` props, so fine.
- `imageSizes`: `16` removed from defaults. We don't serve 16-px images.
- `maximumRedirects`: unlimited → 3. We only serve from `pbs.twimg.com` (1st-party no redirects) and our own origin — fine.

No config change needed. Spot-check `/` and one article page post-upgrade to confirm cover images still render correctly.

### 5. Leave Cache Components **off** for now

Next 16 introduces `cacheComponents: true` (the PPR successor) and the new `"use cache"` directive. We should **not** turn these on in this upgrade PR.

Reason: our `/articles/[slug]` routes are already fully static (`generateStaticParams` + no dynamic APIs = the whole page is prerendered at build and served from the CDN). Cache Components pays off when a page mixes static and dynamic — e.g. a mostly-static article page with a personalised greeting or live view count. We don't have that yet.

File that under "future blog-post opportunity": *"When I added a view counter to my static blog — a case study in Next.js Cache Components"*. Ship the upgrade clean first.

### 6. Sanity-check `viewTransition`

`experimental.viewTransition: true` is still experimental in v16. Confirm it still functions after upgrade by navigating between articles (the cover-image morph). If it breaks or regresses, we can disable it in the same PR and revisit.

## Verification plan

Reuse the pattern from the perf pass — baseline before, record after, compare.

**Before the upgrade (on the current `main`):**

1. `npm run build && npm run start`
2. From `/`, click into `/articles/radial-menu-button`. Record the following via `scripts/perf/`:
   - `lcp-sub-parts.js` on home and one article
   - `long-animation-frames.js` during a soft nav
3. Save outputs to `reports/before-next16/`
4. Also capture `next build` output (First Load JS sizes per route)

**After the upgrade:**

1. Run the codemod, commit.
2. `npm run build && npm run start` — expect the "using Turbopack" banner and no behavioural regressions.
3. Re-run the same scripts, save to `reports/after-next16/`
4. Diff the build output against the before.

**What would make us roll back:**

- `next build` fails and the fix isn't trivial (e.g. Turbopack incompatible with a dep and there's no straightforward escape).
- Visual regression on article cover images or dynamic-island.
- LCP / First Load JS regresses by > 10 % vs. before. (A small increase is tolerated in exchange for React 19.2 + better routing.)

## Rollback

One commit = easy revert:

```bash
git revert <upgrade-commit-sha>
# or if staged but unmerged:
git checkout main -- package.json package-lock.json next.config.mjs eslint.config.mjs
npm install
```

Keep the upgrade as a single commit (or at most two — codemod changes + manual follow-ups) so rollback is a single `git revert`.

## Nice-to-have follow-ups (separate PRs, not part of this upgrade)

- Enable the **React Compiler** (`reactCompiler: true`) — now stable in v16. Would memoise `BioInteractive`, `MiniPlayer`, etc. automatically. Good blog-post fodder.
- Migrate `next.config.mjs` → `vercel.ts` for typed Vercel project config (per the Vercel plugin's v16 guidance).
- Once soft-nav LCP tooling improves, wrap the perf pass into the `reports/` pattern and publish it as a case study.

## Open questions

- Should the upgrade commit also include the React Compiler opt-in, or is that its own PR? **Recommend separate PR** — compiler enable-time is non-trivial (~2–5× longer builds) and worth isolating so we can flip it off fast if builds blow up.
- Do we want to cap the commit count at 1 (mega-commit with codemod output) or split into (a) codemod output and (b) manual lint config change? **Recommend 1 commit** for rollback simplicity.
