import type { Action, ActionSource } from "../types";

const staticActions: Action[] = [
  {
    id: "toggle-theme",
    title: "Toggle theme",
    subtitle: "Switch between light and dark",
    keywords: ["dark", "light", "mode", "appearance"],
    perform: (ctx) => {
      const root = document.documentElement;
      root.classList.toggle("dark");
      ctx.toast({
        title: root.classList.contains("dark") ? "Dark mode" : "Light mode",
      });
    },
  },
  {
    id: "copy-link",
    title: "Copy page link",
    keywords: ["share", "url", "clipboard"],
    perform: async (ctx) => {
      await navigator.clipboard.writeText(window.location.href);
      ctx.toast({ kind: "success", title: "Link copied" });
    },
  },
  {
    id: "print-page",
    title: "Print this page",
    keywords: ["pdf", "save"],
    perform: () => {
      window.print();
    },
  },
  {
    id: "fake-deploy",
    title: "Deploy production (demo)",
    subtitle: "Async with confirm — try cancelling mid-flight",
    keywords: ["ship", "release"],
    confirm: {
      title: "Deploy to production?",
      description: "This will deploy the current main branch.",
      confirmLabel: "Deploy",
    },
    perform: async (ctx) => {
      ctx.toast({ title: "Deploy started" });
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, 1500);
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
      ctx.toast({ kind: "success", title: "Deployed to production" });
    },
  },
  {
    id: "fake-delete",
    title: "Delete project (demo)",
    subtitle: "Destructive confirm step",
    keywords: ["remove", "destroy"],
    confirm: {
      title: "Delete project?",
      description: "This cannot be undone. (Demo — nothing real will happen.)",
      confirmLabel: "Delete",
      destructive: true,
    },
    perform: (ctx) => {
      ctx.toast({ kind: "success", title: "Project deleted (demo)" });
    },
  },
  {
    id: "clear-recents",
    title: "Clear recent items",
    keywords: ["reset", "history"],
    perform: (ctx) => {
      try {
        localStorage.removeItem("tech-blog.cmdk.recent");
      } catch {}
      ctx.toast({ title: "Recents cleared" });
    },
  },
];

export const actionsSource: ActionSource = {
  id: "actions",
  section: "Actions",
  priority: 30,
  getItems: () => staticActions,
};
