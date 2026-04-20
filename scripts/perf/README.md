# Perf Audit Snippets

Browser-console snippets sourced from [webperf-snippets.nucliweb.net](https://webperf-snippets.nucliweb.net/).

## Usage — DevTools console
Open the page, paste a file's contents into the console.

## Usage — chrome-devtools-mcp CLI
```bash
chrome-devtools navigate_page --type url --url "https://www.jamesdawson.dev/articles/trailing-gradient-button"
chrome-devtools evaluate_script "() => { $(cat scripts/perf/lcp.js) }"
chrome-devtools evaluate_script "() => { $(cat scripts/perf/lcp-sub-parts.js) }"
chrome-devtools evaluate_script "() => { $(cat scripts/perf/render-blocking.js) }"
chrome-devtools evaluate_script "() => { $(cat scripts/perf/long-task.js) }"
chrome-devtools evaluate_script "() => { $(cat scripts/perf/cls.js) }"
chrome-devtools evaluate_script "() => { $(cat scripts/perf/content-visibility.js) }"
```

## Files
| File | What it measures |
| --- | --- |
| `lcp.js` | Largest Contentful Paint + element attribution (hard nav) |
| `lcp-sub-parts.js` | LCP broken into TTFB / load delay / load time / render delay |
| `cls.js` | Cumulative Layout Shift (live + `getCLS()`) |
| `inp.js` | Interaction to Next Paint (requires interaction → `getINP()`) |
| `long-task.js` | Main-thread blocking > 50ms (→ `getLongTaskSummary()`) |
| `long-animation-frames.js` | LoAF — main-thread blocking with script attribution (→ `getLoAFSummary()`) |
| `render-blocking.js` | Resources blocking initial render (Chrome 107+) |
| `content-visibility.js` | Audits existing `content-visibility` + finds candidates |
| `soft-nav-lcp.js` | Click-to-LCP for SPA / App Router transitions (Chrome 127+ → `getSoftNavLCP()`) |

Thresholds follow web.dev Core Web Vitals: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms.
