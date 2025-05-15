// components/ui/console-wrapper.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ConsoleWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function ConsoleWrapper({
  children,
  className,
}: ConsoleWrapperProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2}}
      className={`relative my-8 border rounded-2xl overflow-hidden border-stone-700 bg-stone-800 shadow-xl shadow-slate-950/20 code-scrollbar ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}
