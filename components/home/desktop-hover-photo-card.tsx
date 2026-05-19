"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PreviewSide } from "./badge-types";

export default function DesktopHoverPhotoCard({
  show,
  side = "right",
  children,
}: {
  show: boolean;
  side?: PreviewSide;
  children: ReactNode;
}) {
  const isLeft = side === "left";

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{
            opacity: 0,
            x: isLeft ? 18 : -18,
            y: 8,
            rotate: isLeft ? -5 : 5,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            rotate: isLeft ? -3 : 3,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            x: isLeft ? 18 : -18,
            y: 8,
            rotate: isLeft ? -5 : 5,
            scale: 0.96,
          }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={[
            "absolute top-1/2 z-50 hidden md:block",
            isLeft
              ? "right-full mr-4 -translate-y-1/2"
              : "left-full ml-4 -translate-y-1/2",
          ].join(" ")}
        >
          <div className="w-[220px] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
