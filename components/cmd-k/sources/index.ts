import type { ActionSource } from "../types";
import { recentSource } from "./recent";
import { navSource } from "./nav";
import { actionsSource } from "./actions";
import { searchApiSource } from "./search-api";

export { recentSource, navSource, actionsSource, searchApiSource };
export { navRoutes } from "./nav";
export { readRecents, recordRecent } from "./recent-storage";
export type { NavRoute } from "./nav";
export type { RecentEntry } from "./recent-storage";

export const defaultSources: ActionSource[] = [
  recentSource,
  navSource,
  actionsSource,
  searchApiSource,
];
