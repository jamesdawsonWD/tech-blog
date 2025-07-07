// components/CodeRenderer.tsx
"use client";

import { useEffect, useState, JSX } from "react";
import { codeToHast, type BundledLanguage } from "shiki/bundle/web";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCopy, Check } from "lucide-react";

type CodeRendererProps = {
  code: string;
  lang: BundledLanguage;
  animateEntry?: boolean;
  showCopyButton: boolean;
  reverse?: boolean;
};

export function CodeRenderer({
  code,
  lang,
  showCopyButton = true,
  reverse = false,
}: CodeRendererProps) {
  const [nodes, setNodes] = useState<JSX.Element | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void (async () => {
      const hast = await codeToHast(code.trim(), {
        lang,
        theme: "dark-plus",
      });

      if (
        
        hast.children === "pre" &&
        hast.properties
      ) {
        hast.properties.className = [
          ...(hast.properties.className || []),
          "h-full",
        ];
      }

      const jsxElement = toJsxRuntime(hast, {
        Fragment,
        jsx,
        jsxs,
      });

      setNodes(jsxElement);
    })();
  }, [code, lang]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="overflow-auto text-sm relative [&_pre]:mt-0 [&_pre]:mb-0 min-h-max h-full">
      {nodes ?? (
        <div
          className="flex justify-center items-center p-4"
          role="status"
          aria-live="polite"
          aria-label="Loading"
        >
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
            aria-hidden="true"
          />
          <span className="sr-only">Loading...</span>
        </div>
      )}

      <div className="hidden">
        <ClipboardCopy />
      </div>

      <AnimatePresence>
        {nodes && showCopyButton && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCopy}
            className="absolute bottom-4 right-4 bg-stone-700 hover:bg-stone-600 text-white p-3 rounded-lg shadow-md transition"
            title="Copy to clipboard"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.1 }}
                >
                  <Check size={20} className="text-green-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="clipboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.1 }}
                >
                  <ClipboardCopy size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
