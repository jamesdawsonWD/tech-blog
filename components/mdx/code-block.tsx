"use client";
import type { BundledLanguage } from "shiki/bundle/web";
import { CodeRenderer } from "./code-renderer";
import { motion } from "framer-motion";

export type CodeBlockProps = {
  name: string; // filename label (e.g. "index.tsx")
  lang: BundledLanguage; // language for syntax highlighting
  children: string; // raw code as string
};

export function CodeBlock({ name, lang, children }: CodeBlockProps) {
  return (
    <motion.div
      layout
      className="relative my-8 border rounded-2xl overflow-hidden border-stone-700 bg-stone-800 shadow-xl shadow-slate-950/20 code-scrollbar"
    >
      {name ? (
        <div className="relative flex border-b border-stone-700 px-4 py-2 text-sm font-medium text-stone-200 bg-stone-900">
          {name}
        </div>
      ) : (
        <></>
      )}

      <CodeRenderer code={children} lang={lang} animateEntry />
    </motion.div>
  );
}
