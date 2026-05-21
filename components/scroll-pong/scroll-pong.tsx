"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Pong, where YOUR paddle is the browser scrollbar.
 *
 * The right paddle is recomputed every frame from the live scroll position —
 * its size and travel mirror a native scrollbar thumb. To return the ball you
 * scroll the page (the same gesture you'd use to read the article). The left
 * paddle is a capped CPU. The overlay is pointer-events:none so it never
 * blocks reading.
 */
export default function ScrollPong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ you: 0, cpu: 0 });
  const [started, setStarted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const PADDLE_T = 8;
    const MIN_PADDLE_H = 40;
    const CPU_X = 24;
    const R = 7;
    const BASE_SPEED = 4.2;
    const MAX_SPEED = 13;
    const CPU_MAX = 4.6;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let cpuY = 0;
    let running = !document.hidden;

    // Read the live foreground color so ball + both paddles match the article
    // text exactly across themes, including any custom CSS-variable overrides.
    const colorProbe = document.createElement("span");
    colorProbe.style.cssText =
      "position:absolute;visibility:hidden;color:var(--foreground)";
    document.body.appendChild(colorProbe);
    const readForeground = () =>
      getComputedStyle(colorProbe).color || "rgb(28,25,23)";
    let strokeColor = readForeground();

    const darkMq = window.matchMedia("(prefers-color-scheme: dark)");
    const refreshColor = () => {
      strokeColor = readForeground();
    };
    darkMq.addEventListener("change", refreshColor);
    // Theme toggle changes the `.dark` class on <html>, not the system pref.
    const themeObserver = new MutationObserver(refreshColor);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });

    const ball = { x: 0, y: 0, vx: 0, vy: 0, speed: BASE_SPEED };
    let serveTo: 1 | -1 = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const serve = () => {
      ball.x = W / 2;
      ball.y = H / 2;
      ball.speed = BASE_SPEED;
      const angle = (Math.random() * 0.5 - 0.25) * Math.PI;
      ball.vx = serveTo * ball.speed * Math.cos(angle);
      ball.vy = ball.speed * Math.sin(angle);
      cpuY = H / 2;
    };

    const scrollbarThumb = () => {
      const docH = document.documentElement.scrollHeight;
      const scrollMax = docH - H;
      const thumbH = Math.max(MIN_PADDLE_H, H * (H / docH));
      const t =
        scrollMax > 0
          ? Math.min(1, Math.max(0, window.scrollY / scrollMax))
          : 0.5;
      const y = t * (H - thumbH);
      return { y, h: thumbH, x: W - PADDLE_T };
    };

    resize();
    serve();
    cpuY = H / 2;

    const step = () => {
      const thumb = scrollbarThumb();
      const playerH = thumb.h;
      const cpuH = (playerH * 2) / 3;

      if (running) {
        const prevX = ball.x;
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.y - R < 0) {
          ball.y = R;
          ball.vy = Math.abs(ball.vy);
        } else if (ball.y + R > H) {
          ball.y = H - R;
          ball.vy = -Math.abs(ball.vy);
        }

        const target = ball.y - cpuH / 2;
        cpuY += Math.max(-CPU_MAX, Math.min(CPU_MAX, target - cpuY));
        cpuY = Math.max(0, Math.min(H - cpuH, cpuY));

        const bounce = (offset: number, dir: 1 | -1) => {
          ball.speed = Math.min(MAX_SPEED, ball.speed * 1.045);
          const norm = Math.max(-1, Math.min(1, offset));
          const angle = norm * (Math.PI / 3.2);
          ball.vx = dir * ball.speed * Math.cos(angle);
          ball.vy = ball.speed * Math.sin(angle);
        };

        const planeR = W - PADDLE_T;
        if (
          ball.vx > 0 &&
          prevX + R <= planeR &&
          ball.x + R >= planeR &&
          ball.y >= thumb.y - R &&
          ball.y <= thumb.y + thumb.h + R
        ) {
          ball.x = planeR - R;
          bounce((ball.y - (thumb.y + thumb.h / 2)) / (thumb.h / 2), -1);
        }

        const planeL = CPU_X + PADDLE_T;
        if (
          ball.vx < 0 &&
          prevX - R >= planeL &&
          ball.x - R <= planeL &&
          ball.y >= cpuY - R &&
          ball.y <= cpuY + cpuH + R
        ) {
          ball.x = planeL + R;
          bounce((ball.y - (cpuY + cpuH / 2)) / (cpuH / 2), 1);
        }

        if (ball.x - R > W) {
          serveTo = -1;
          setScore((s) => ({ ...s, cpu: s.cpu + 1 }));
          serve();
        } else if (ball.x + R < 0) {
          serveTo = 1;
          setScore((s) => ({ ...s, you: s.you + 1 }));
          serve();
        }
      }

      ctx.clearRect(0, 0, W, H);

      // Track — faint full-height rail behind the player paddle
      ctx.fillStyle = strokeColor;
      ctx.globalAlpha = 0.12;
      roundRect(ctx, thumb.x, 4, PADDLE_T, H - 8, PADDLE_T / 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // CPU paddle (left) — 1/3 the player paddle for added difficulty
      roundRect(ctx, CPU_X, cpuY, PADDLE_T, cpuH, PADDLE_T / 2);
      ctx.fill();

      roundRect(ctx, thumb.x, thumb.y, PADDLE_T, thumb.h, PADDLE_T / 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(step);
    };

    let raf = requestAnimationFrame(step);

    const onResize = () => resize();
    const onVis = () => {
      running = !document.hidden;
    };
    const onScroll = () => setStarted(true);

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("scroll", onScroll, { passive: true, once: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("scroll", onScroll);
      darkMq.removeEventListener("change", refreshColor);
      themeObserver.disconnect();
      colorProbe.remove();
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <ScoreIsland cpu={0} you={0} hint="pong disabled — reduced motion" />
    );
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="fixed inset-0 z-[60] pointer-events-none"
      />
      <ScoreIsland
        cpu={score.cpu}
        you={score.you}
        hint={!started ? "scroll to play — you are the scrollbar" : undefined}
      />
    </>
  );
}

function ScoreIsland({
  cpu,
  you,
  hint,
}: {
  cpu: number;
  you: number;
  hint?: string;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex flex-col items-center"
    >
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8, delay: 0.15 }}
        style={{ borderRadius: 28 }}
        className="overflow-hidden bg-black shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      >
        <div className="flex h-[36px] items-center gap-3 px-4 select-none">
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/50">
            CPU
          </span>
          <motion.span
            key={`cpu-${cpu}`}
            initial={{ scale: 1.4, color: "rgb(248 113 113)" }}
            animate={{ scale: 1, color: "rgb(255 255 255)" }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="font-mono text-sm tabular-nums font-semibold"
          >
            {cpu}
          </motion.span>
          <div className="h-3 w-px bg-white/15" />
          <motion.span
            key={`you-${you}`}
            initial={{ scale: 1.4, color: "rgb(74 222 128)" }}
            animate={{ scale: 1, color: "rgb(255 255 255)" }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="font-mono text-sm tabular-nums font-semibold"
          >
            {you}
          </motion.span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/50">
            You
          </span>
        </div>
      </motion.div>
      {hint && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-2 font-mono text-[11px] text-stone-500 dark:text-stone-400"
        >
          {hint}
        </motion.div>
      )}
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
