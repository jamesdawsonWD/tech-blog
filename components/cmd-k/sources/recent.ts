import type { Action, ActionSource } from "../types";
import { readRecents, recordRecent } from "./recent-storage";

export const recentSource: ActionSource = {
  id: "recent",
  section: "Recent",
  priority: 10,
  when: (ctx) => ctx.query.length === 0,
  getItems: () =>
    readRecents().map(
      (r): Action => ({
        id: `recent:${r.id}`,
        title: r.title,
        subtitle: r.subtitle,
        href: r.href,
        perform: (ctx) => {
          recordRecent({ id: r.id, title: r.title, subtitle: r.subtitle, href: r.href });
          ctx.router.push(r.href);
        },
      }),
    ),
};
