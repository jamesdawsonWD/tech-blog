"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function MobileInlinePhotoCard({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute left-0 top-full z-40 mt-3 block md:hidden"
        >
          <div className="w-[170px] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_14px_40px_rgba(0,0,0,0.14)]">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
