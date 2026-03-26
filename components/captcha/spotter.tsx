"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { createGame } from "./spotter/game";

interface SpotterProps {
  mode?: "default" | "captcha";
  lives?: number;
  onFoundChange?: (value: boolean) => void;
  onWrongGuess?: () => void;
}

export default function Spotter({
  mode = "default",
  lives = 3,
  onFoundChange,
  onWrongGuess,
}: SpotterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const panel = panelRef.current;
    if (!canvas || !panel) return;

    let cancelled = false;
    let destroy: (() => void) | undefined;

    createGame(canvas, panel, {
      mode,
      onFoundChange,
      onWrongGuess,
    }).then((game) => {
      if (cancelled) {
        game.destroy();
        return;
      }
      destroy = game.destroy;
    });

    return () => {
      cancelled = true;
      destroy?.();
      if (panel) panel.innerHTML = "";
    };
  }, [mode, onFoundChange, onWrongGuess]);

  if (mode === "captcha") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{
          opacity: 0,
          y: 4,
          transition: {
            opacity: { duration: 0.15, ease: "easeOut" },
            y: { duration: 0.15, ease: "easeOut" },
          },
        }}
        transition={{
          layout: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.2, ease: "easeOut" },
          y: { duration: 0.24, ease: "easeOut" },
        }}
      >
        <div className="flex items-stretch gap-4 pb-4">
          <motion.div
            layout
            ref={panelRef}
            className="h-full shrink-0 aspect-square rounded-md border border-neutral-200 bg-neutral-100/70 dark:border-neutral-700 dark:bg-neutral-800/60"
          />
          <motion.div
            className="max-w-md text-left"
            initial={false}
            exit={{
              opacity: 0,
              transition: { duration: 0.16, ease: "easeOut" },
            }}
          >
            <h3
              className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
              style={{
                fontFamily: '"Comic Sans MS","Chalkboard SE","Marker Felt",cursive',
              }}
            >
              Click the matching character
            </h3>
            <p
              className="mt-2 text-sm text-neutral-600 dark:text-neutral-300"
              style={{
                fontFamily: '"Comic Sans MS","Chalkboard SE","Marker Felt",cursive',
              }}
            >
              Find and click the matching character to prove you are a human.
            </p>
          </motion.div>
        </div>

        <motion.div
          layout
          className="relative flex justify-center overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900/40"
          transition={{ layout: { duration: 0.26, ease: [0.22, 1, 0.36, 1] } }}
        >
          <canvas ref={canvasRef} className="block rounded-lg" />
          <div className="pointer-events-none absolute right-2 top-2 rounded-md bg-black/45 px-2 py-1">
            <div className="flex items-center gap-1 text-sm leading-none">
              {Array.from({ length: 3 }, (_, i) => {
                const alive = i < lives;
                return (
                  <motion.span
                    key={i}
                    initial={false}
                    animate={{
                      scale: alive ? 1 : 0.8,
                      opacity: alive ? 1 : 0.35,
                    }}
                    transition={{ duration: 0.2 }}
                    aria-label={alive ? "life available" : "life lost"}
                  >
                    {alive ? "❤️" : "🖤"}
                  </motion.span>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex flex-col items-center gap-2"
    >
      <canvas ref={canvasRef} className="rounded-lg shadow-lg" />
      <div ref={panelRef} />
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Click the matching character — click again to replay
      </p>
    </motion.div>
  );
}
