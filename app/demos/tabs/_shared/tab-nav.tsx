"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  { slug: "overview", label: "Overview" },
  { slug: "activity", label: "Activity" },
  { slug: "settings", label: "Settings" },
];

function postClick(slug: string, href: string) {
  if (typeof window === "undefined") return;
  if (window.parent === window) return;
  window.parent.postMessage(
    { type: "perf-tabs:click", slug, href, t: performance.now() },
    "*"
  );
}

export function TabNav({
  basePath,
  prefetch = true,
}: {
  basePath: string;
  prefetch?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const qs = searchParams.toString();
  const suffix = qs ? `?${qs}` : "";

  return (
    <nav className="relative inline-flex gap-1 rounded-lg bg-zinc-100 p-1">
      {items.map((item) => {
        const href = `${basePath}/${item.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={item.slug}
            href={`${href}${suffix}`}
            prefetch={prefetch}
            onClick={() => postClick(item.slug, href)}
            className={cn(
              "relative px-3 py-1.5 rounded-md text-sm transition-colors",
              active ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            {active && (
              <motion.span
                layoutId={`tab-pill-${basePath}`}
                className="absolute inset-0 rounded-md bg-white shadow-sm"
                transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
