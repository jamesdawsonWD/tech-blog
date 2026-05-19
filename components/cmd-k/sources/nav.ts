import type { Action, ActionSource } from "../types";
import { recordRecent } from "./recent-storage";

export type NavRoute = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  keywords?: string[];
};

export const navRoutes: NavRoute[] = [
  { id: "home", title: "Home", href: "/" },
  { id: "cv", title: "CV", href: "/cv", keywords: ["resume", "about"] },
  {
    id: "article-200ms",
    title: "Doing skeletons well in Next.js",
    subtitle: "Performance article",
    href: "/articles/the-200ms-tab-jank",
    keywords: ["jank", "skeleton", "performance"],
  },
  {
    id: "article-radial",
    title: "Radial menu button",
    subtitle: "UI article",
    href: "/articles/radial-menu-button",
    keywords: ["menu", "radial"],
  },
  {
    id: "article-gradient",
    title: "Trailing gradient button",
    subtitle: "CSS article",
    href: "/articles/trailing-gradient-button",
    keywords: ["gradient", "conic", "css"],
  },
];

export const navSource: ActionSource = {
  id: "nav",
  section: "Go to",
  priority: 20,
  getItems: () =>
    navRoutes.map(
      (r): Action => ({
        id: `nav:${r.id}`,
        title: r.title,
        subtitle: r.subtitle,
        keywords: r.keywords,
        href: r.href,
        perform: (ctx) => {
          recordRecent({ id: r.id, title: r.title, subtitle: r.subtitle, href: r.href });
          ctx.router.push(r.href);
        },
      }),
    ),
};
