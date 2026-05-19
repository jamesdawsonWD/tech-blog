"use client";
import { useState } from "react";
import { CodeRenderer } from "./code-renderer";
import type { BundledLanguage } from "shiki/bundle/web";
import { motion } from "framer-motion";

export type CodeOption = {
  name: string; // label shown on the tab (e.g. "pnpm", "npm")
  lang: BundledLanguage; // language for syntax highlighting
  code: string; // raw code string
};

export type CodeGroupProps = {
  options: CodeOption[]; // list of tabbed code blocks
};
export function CodeGroup({ options }: CodeGroupProps) {
  const [selected, setSelected] = useState(options[0].name);
  const [hovered, setHovered] = useState(null);

  const current = options.find((opt) => opt.name === selected) || options[0];

  return (
    <div className="relative my-[var(--article-rhythm-lg)] border rounded-2xl overflow-hidden border-stone-700 bg-stone-800 shadow-xl shadow-slate-950/20">
      <div className="relative flex border-b border-stone-700">
        {options.map((opt) => (
          <button
            key={opt.name}
            className="relative px-4 py-2 text-sm font-medium text-stone-200 hover:text-white transition"
            onClick={() => setSelected(opt.name)}
            onMouseEnter={() => setHovered(opt.name)}
            onMouseLeave={() => setHovered(null)}
          >
            {(selected === opt.name || hovered === opt.name) && (
              <motion.div
                layoutId="tabHighlight"
                className={`absolute inset-0 rounded-sm z-0 ${
                  selected === opt.name
                    ? "bg-stone-900 text-white"
                    : "bg-stone-800"
                }`}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{opt.name}</span>
          </button>
        ))}
      </div>

      <CodeRenderer
        code={current.code}
        lang={current.lang}
        animateEntry={false}
      />
    </div>
  );
}
