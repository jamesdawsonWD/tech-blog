"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Spotter from "./spotter";

// ── Confetti burst ──────────────────────────────────────────────────────

const CONFETTI_COUNT = 60;
const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899", "#a855f7", "#14b8a6"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  opacity: number;
}

function ConfettiBurst({ fire }: { fire: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!fire) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const rect = canvas.parentElement!.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(2, 2);

    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const particles: Particle[] = Array.from({ length: CONFETTI_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        w: 4 + Math.random() * 4,
        h: 3 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        gravity: 0.12 + Math.random() * 0.06,
        opacity: 1,
      };
    });

    let raf: number;
    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      let alive = false;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.985;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, p.opacity - 0.008);

        if (p.opacity <= 0) continue;
        alive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (alive) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(raf);
  }, [fire]);

  if (!fire) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
    />
  );
}

export default function Captcha() {
  const [, setChecked] = useState(false);
  const [won, setWon] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isCardWide, setIsCardWide] = useState(false);
  const [lives, setLives] = useState(3);
  const [isHeaderTransitioning, setIsHeaderTransitioning] = useState(false);
  const [isResettingResult, setIsResettingResult] = useState(false);
  const headerTransitionTimeoutRef = useRef<number | null>(null);
  const modalOpenTimeoutRef = useRef<number | null>(null);
  const modalCloseTimeoutRef = useRef<number | null>(null);
  const resetFadeTimeoutRef = useRef<number | null>(null);
  const resetDoneTimeoutRef = useRef<number | null>(null);

  const clearModalTimers = () => {
    if (modalOpenTimeoutRef.current !== null) {
      window.clearTimeout(modalOpenTimeoutRef.current);
      modalOpenTimeoutRef.current = null;
    }
    if (modalCloseTimeoutRef.current !== null) {
      window.clearTimeout(modalCloseTimeoutRef.current);
      modalCloseTimeoutRef.current = null;
    }
  };

  const clearResetTimers = () => {
    if (resetFadeTimeoutRef.current !== null) {
      window.clearTimeout(resetFadeTimeoutRef.current);
      resetFadeTimeoutRef.current = null;
    }
    if (resetDoneTimeoutRef.current !== null) {
      window.clearTimeout(resetDoneTimeoutRef.current);
      resetDoneTimeoutRef.current = null;
    }
  };

  const triggerHeaderTransition = () => {
    if (headerTransitionTimeoutRef.current !== null) {
      window.clearTimeout(headerTransitionTimeoutRef.current);
    }
    setIsHeaderTransitioning(true);
    headerTransitionTimeoutRef.current = window.setTimeout(() => {
      setIsHeaderTransitioning(false);
      headerTransitionTimeoutRef.current = null;
    }, 140);
  };

  useEffect(() => {
    return () => {
      if (headerTransitionTimeoutRef.current !== null) {
        window.clearTimeout(headerTransitionTimeoutRef.current);
      }
      clearModalTimers();
      clearResetTimers();
    };
  }, []);

  const autoResetRef = useRef<number | null>(null);
  useEffect(() => {
    if (!failed) return;
    autoResetRef.current = window.setTimeout(() => {
      autoResetRef.current = null;
      setIsResettingResult(true);
      resetFadeTimeoutRef.current = window.setTimeout(() => {
        setChecked(false);
        setWon(false);
        setFailed(false);
        setShowModal(false);
        setIsCardWide(false);
        setLives(3);
        resetFadeTimeoutRef.current = null;
      }, 160);
      resetDoneTimeoutRef.current = window.setTimeout(() => {
        setIsResettingResult(false);
        resetDoneTimeoutRef.current = null;
      }, 260);
    }, 1800);
    return () => {
      if (autoResetRef.current !== null) {
        window.clearTimeout(autoResetRef.current);
        autoResetRef.current = null;
      }
    };
  }, [failed]);

  const openCaptchaPanel = () => {
    clearModalTimers();
    setIsCardWide(true);
    modalOpenTimeoutRef.current = window.setTimeout(() => {
      setShowModal(true);
      modalOpenTimeoutRef.current = null;
    }, 90);
  };

  const closeCaptchaPanel = () => {
    clearModalTimers();
    setShowModal(false);
    modalCloseTimeoutRef.current = window.setTimeout(() => {
      setIsCardWide(false);
      modalCloseTimeoutRef.current = null;
    }, 170);
  };

  const handleSpotterFoundChange = useCallback(
    (value: boolean) => {
      if (!value) return;
      clearModalTimers();
      setFailed(false);
      setWon(true);
      setShowModal(false);
      setIsCardWide(false);
    },
    [],
  );

  const handleSpotterWrongGuess = useCallback(() => {
    setLives((prev) => {
      const next = Math.max(0, prev - 1);
      if (next === 0) {
        clearModalTimers();
        setShowModal(false);
        setIsCardWide(false);
        setWon(false);
        setFailed(true);
        setChecked(true);
      }
      return next;
    });
  }, []);

  const reset = () => {
    clearModalTimers();
    clearResetTimers();

    if (won || failed) {
      setIsResettingResult(true);
      resetFadeTimeoutRef.current = window.setTimeout(() => {
        setChecked(false);
        setWon(false);
        setFailed(false);
        setShowModal(false);
        setIsCardWide(false);
        setLives(3);
        resetFadeTimeoutRef.current = null;
      }, 160);
      resetDoneTimeoutRef.current = window.setTimeout(() => {
        setIsResettingResult(false);
        resetDoneTimeoutRef.current = null;
      }, 260);
      return;
    }

    setIsResettingResult(false);
    setChecked(false);
    setWon(false);
    setFailed(false);
    setShowModal(false);
    setIsCardWide(false);
    setLives(3);
  };

  const layoutSpring = {
    type: "spring" as const,
    stiffness: 260,
    damping: 26,
    mass: 0.9,
  };
  const cardViewKey = won ? "captcha-success" : failed ? "captcha-failure" : "captcha-base";

  return (
    <div className="flex flex-col items-center gap-6">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={cardViewKey}
          initial={false}
          animate={{ opacity: 1 }}
          exit={
            isResettingResult
              ? { opacity: 1, filter: "blur(0px)" }
              : { opacity: 0, filter: "blur(1.5px)" }
          }
          transition={{
            opacity: { duration: isResettingResult ? 0 : 0.08, ease: "easeOut" },
            filter: { duration: isResettingResult ? 0 : 0.08, ease: "easeOut" },
            duration: 0,
          }}
          className="relative"
        >
          <ConfettiBurst fire={won && !isResettingResult} />
          <div
            className="relative z-10 select-none rounded border border-neutral-300 bg-neutral-50 shadow-sm transition-[width] duration-300 ease-out dark:border-neutral-700 dark:bg-neutral-900"
            style={{ width: isCardWide ? "min(980px, calc(100vw - 2rem))" : 304 }}
          >
            {/* Top bar */}
            <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            onClick={() => {
              if (won) return;
              if (showModal) {
                closeCaptchaPanel();
                return;
              }
              setFailed(false);
              setChecked(true);
              setLives(3);
              triggerHeaderTransition();
              openCaptchaPanel();
            }}
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded border-2 border-neutral-300 bg-white transition-colors dark:border-neutral-600 dark:bg-neutral-800"
            animate={{
              filter: isHeaderTransitioning ? "blur(1px)" : "blur(0px)",
            }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          >
            <AnimatePresence mode="wait">
              {won && (
                <motion.svg
                  key="captcha-check"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
                  animate={
                    isResettingResult
                      ? { scale: 0.9, opacity: 0, rotate: 8 }
                      : { scale: 1, opacity: 1, rotate: 0 }
                  }
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={
                    isResettingResult
                      ? { duration: 0.15, ease: "easeOut" }
                      : { type: "spring", stiffness: 320, damping: 18 }
                  }
                >
                  <motion.path
                    d="M20 6L9 17L4 12"
                    initial={{ pathLength: 0, opacity: 0.2 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  />
                </motion.svg>
              )}
              {!won && failed && (
                <motion.svg
                  key="captcha-cross"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-rose-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ scale: 0.2, opacity: 0, x: 0 }}
                  animate={
                    isResettingResult
                      ? { scale: 0.9, opacity: 0, x: 0 }
                      : {
                          scale: 1,
                          opacity: 1,
                          x: [0, -6, 6, -6, 6, -5, 5, -4, 4, -3, 3, -2, 2, 0],
                        }
                  }
                  exit={{ y: -6, opacity: 0 }}
                  transition={
                    isResettingResult
                      ? { duration: 0.15, ease: "easeOut" }
                      : {
                          scale: { type: "spring", stiffness: 320, damping: 18 },
                          opacity: { type: "spring", stiffness: 320, damping: 18 },
                          x: { duration: 0.7, ease: "easeOut", delay: 0.08 },
                          y: { duration: 0.2, ease: "easeOut" },
                        }
                  }
                >
                  <motion.path
                    d="M6 6L18 18M18 6L6 18"
                    initial={{ pathLength: 0, opacity: 0.2 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>
          <span className="relative inline-flex overflow-hidden text-sm" style={{ height: "1.5em" }}>
            <AnimatePresence mode="wait" initial={false}>
              {failed && !isResettingResult ? (
                <motion.span
                  key="fail-label"
                  className="inline-block text-rose-500"
                  initial={{ y: "-150%", opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: "100%", opacity: 0, filter: "blur(3px)", transition: { duration: 0.12, ease: "easeIn" } }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  You <span className="font-bold">shall not</span> pass
                </motion.span>
              ) : (
                <motion.span
                  key="default-label"
                  className="inline-block text-neutral-700 dark:text-neutral-300"
                  initial={{ y: "-150%", opacity: 0, filter: "blur(4px)" }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    filter: isHeaderTransitioning ? "blur(1px)" : "blur(0px)",
                  }}
                  exit={{ y: "100%", opacity: 0, filter: "blur(3px)", transition: { duration: 0.12, ease: "easeIn" } }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  I&apos;m not a robot
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <div className="ml-auto flex flex-col items-center">
            <motion.span
              className="text-[10px] font-bold leading-tight text-neutral-400"
              animate={{
                filter: isHeaderTransitioning ? "blur(1px)" : "blur(0px)",
              }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              reCAPTCHA
            </motion.span>
            <motion.span
              className="text-[8px] leading-tight text-neutral-400"
              animate={{
                filter: isHeaderTransitioning ? "blur(1px)" : "blur(0px)",
              }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              Privacy - Terms
            </motion.span>
          </div>
            </div>


            <AnimatePresence initial={false} mode="wait">
              {showModal && !won && (
                <motion.div
                  key="inline-game"
                  layout
                  className="overflow-hidden border-t border-neutral-200 dark:border-neutral-700"
                  initial={{ height: 0, opacity: 0, y: 8 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    y: 6,
                    transition: {
                      height: { duration: 0.2, ease: "easeInOut" },
                      opacity: { duration: 0.15, ease: "easeOut" },
                      y: { duration: 0.15, ease: "easeOut" },
                    },
                  }}
                  transition={{
                    layout: layoutSpring,
                    height: { duration: 0.32, ease: "easeInOut" },
                    opacity: { duration: 0.24, ease: "easeOut" },
                    y: { duration: 0.24, ease: "easeOut" },
                  }}
                >
                  <motion.div
                    layout
                    className="p-4"
                    initial={{
                      opacity: 0,
                      y: 8,
                      backgroundColor: "rgba(59, 130, 246, 0.12)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      backgroundColor: "rgba(59, 130, 246, 0)",
                    }}
                    exit={{
                      opacity: 0,
                      y: 6,
                    }}
                    transition={{
                      duration: 0.34,
                      ease: "easeOut",
                      delay: 0.08,
                    }}
                  >
                    <Spotter
                      mode="captcha"
                      lives={lives}
                      onFoundChange={handleSpotterFoundChange}
                      onWrongGuess={handleSpotterWrongGuess}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col items-center gap-2 text-xs text-neutral-400">
        {won && (
          <button
            onClick={reset}
            className="cursor-pointer underline decoration-neutral-300 underline-offset-2 transition-colors hover:text-neutral-600 dark:decoration-neutral-600 dark:hover:text-neutral-300"
          >
            Reset
          </button>
        )}
      </div>

    </div>
  );
}
