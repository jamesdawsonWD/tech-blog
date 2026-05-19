"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const DELAY_MS = 100;
const ROW_WIDTHS = ["w-2/5", "w-3/5", "w-1/2", "w-2/3"];

type Props = {
  heading: string;
  rows?: number;
};

export function SectionSkeleton({ heading, rows = 4 }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="px-2" aria-busy="true" aria-live="polite">
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{heading}</div>
      {show ? (
        <div className="animate-in fade-in duration-150">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center px-2 py-2.5">
              <div
                className={cn(
                  "h-4 rounded bg-muted animate-pulse",
                  ROW_WIDTHS[i % ROW_WIDTHS.length],
                )}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
