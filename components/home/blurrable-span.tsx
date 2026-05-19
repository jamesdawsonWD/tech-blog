"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import type { BadgeKey } from "./badge-types";

export default function BlurrableSpan({
  children,
  hoveredBadge,
  badgeKey,
}: {
  children: ReactNode;
  hoveredBadge: BadgeKey;
  badgeKey: BadgeKey;
}) {
  const shouldBlur = hoveredBadge && badgeKey !== hoveredBadge;

  return (
    <motion.span
      animate={{
        opacity: shouldBlur ? 0.45 : 1,
        filter: shouldBlur ? "blur(1.5px)" : "blur(0px)",
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={shouldBlur ? "select-none" : ""}
    >
      {children}
    </motion.span>
  );
}
