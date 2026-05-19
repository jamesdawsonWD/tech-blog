import type { Action, ActionSource } from "../types";
import { recordRecent } from "./recent-storage";

const MOCK_ARTICLES = [
  { slug: "the-200ms-tab-jank", title: "Doing skeletons well in Next.js" },
  { slug: "trailing-gradient-button", title: "How to build a trailing gradient button" },
  { slug: "radial-menu-button", title: "Building a radial menu button" },
  { slug: "moon-beam-toggle", title: "A moonbeam toggle" },
  { slug: "pixel-recaptcha-game", title: "Pixel reCAPTCHA game" },
  { slug: "animated-validation", title: "Animated form validation" },
  { slug: "claude-saved-me-from-getting-scammed", title: "Claude saved me from getting scammed" },
  { slug: "exploring-friction-patterns-can-save-you-millions", title: "Friction patterns" },
  { slug: "build-a-newsletter-in-30-minutes", title: "Build a newsletter in 30 minutes" },
];

export const searchApiSource: ActionSource = {
  id: "search",
  section: "Search articles",
  priority: 40,
  debounceMs: 200,
  getItems: (ctx) => {
    if (!ctx.query) return [];
    return new Promise<Action[]>((resolve, reject) => {
      const latency = 350 + Math.random() * 300;
      const t = setTimeout(() => {
        const q = ctx.query.toLowerCase();
        const matches = MOCK_ARTICLES.filter((a) => a.title.toLowerCase().includes(q));
        const items: Action[] = matches.map((a) => {
          const href = `/articles/${a.slug}`;
          return {
            id: `search:${a.slug}`,
            title: a.title,
            subtitle: href,
            href,
            keywords: [ctx.query],
            perform: (actionCtx) => {
              recordRecent({ id: a.slug, title: a.title, subtitle: href, href });
              actionCtx.router.push(href);
            },
          };
        });
        resolve(items);
      }, latency);
      ctx.signal.addEventListener(
        "abort",
        () => {
          clearTimeout(t);
          const err = new Error("AbortError");
          err.name = "AbortError";
          reject(err);
        },
        { once: true },
      );
    });
  },
};
