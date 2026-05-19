"use client";

import { Suspense } from "react";
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

export function TabNav(props: { basePath: string; prefetch?: boolean }) {
  return (
    <Suspense fallback={<TabNavInner {...props} qs="" />}>
      <TabNavWithParams {...props} />
    </Suspense>
  );
}

function TabNavWithParams({
  basePath,
  prefetch,
}: {
  basePath: string;
  prefetch?: boolean;
}) {
  const searchParams = useSearchParams();
  return (
    <TabNavInner
      basePath={basePath}
      prefetch={prefetch}
      qs={searchParams.toString()}
    />
  );
}

function TabNavInner({
  basePath,
  prefetch = true,
  qs,
}: {
  basePath: string;
  prefetch?: boolean;
  qs: string;
}) {
  const pathname = usePathname();
  const suffix = qs ? `?${qs}` : "";

  return (
    <nav className="relative inline-flex gap-1 rounded-lg bg-zinc-900 p-1">
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
              active ? "text-zinc-50" : "text-zinc-400 hover:text-zinc-100"
            )}
          >
            {active && (
              <motion.span
                layoutId={`tab-pill-${basePath}`}
                className="absolute inset-0 rounded-md bg-zinc-700 shadow-sm"
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
