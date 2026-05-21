"use client";

import { useEffect, useRef, useState } from "react";

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

    const PADDLE_T = 12;
    const CPU_X = 24;
    const CPU_H = 96;
    const R = 9;
    const BASE_SPEED = 4.2;
    const MAX_SPEED = 13;
    const CPU_MAX = 4.6;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let cpuY = 0;
    let running = !document.hidden;

    const darkMq = window.matchMedia("(prefers-color-scheme: dark)");
    type Palette = { ball: string; cpu: string; thumb: string; glow: string };
    const paletteFor = (dark: boolean): Palette =>
      dark
        ? {
            ball: "rgb(250, 250, 249)",
            cpu: "rgba(214, 211, 209, 0.7)",
            thumb: "rgba(245, 245, 244, 0.85)",
            glow: "rgba(0, 0, 0, 0.45)",
          }
        : {
            ball: "rgb(28, 25, 23)",
            cpu: "rgba(120, 113, 108, 0.55)",
            thumb: "rgba(68, 64, 60, 0.7)",
            glow: "rgba(0, 0, 0, 0.25)",
          };
    let palette = paletteFor(darkMq.matches);
    const onTheme = (e: MediaQueryListEvent) => {
      palette = paletteFor(e.matches);
    };
    darkMq.addEventListener("change", onTheme);

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
      const thumbH = Math.max(56, H * (H / docH));
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

        const thumb = scrollbarThumb();

        const target = ball.y - CPU_H / 2;
        cpuY += Math.max(-CPU_MAX, Math.min(CPU_MAX, target - cpuY));
        cpuY = Math.max(0, Math.min(H - CPU_H, cpuY));

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
          ball.y <= cpuY + CPU_H + R
        ) {
          ball.x = planeL + R;
          bounce((ball.y - (cpuY + CPU_H / 2)) / (CPU_H / 2), 1);
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
      const thumb = scrollbarThumb();

      ctx.fillStyle = palette.cpu;
      roundRect(ctx, CPU_X, cpuY, PADDLE_T, CPU_H, 6);
      ctx.fill();

      ctx.fillStyle = palette.thumb;
      roundRect(ctx, thumb.x - 1, thumb.y, PADDLE_T, thumb.h, 6);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2);
      ctx.fillStyle = palette.ball;
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

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
      darkMq.removeEventListener("change", onTheme);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <div
        aria-hidden
        className="fixed top-4 left-1/2 z-50 -translate-x-1/2 pointer-events-none select-none text-center"
      >
        <div className="font-mono text-[11px] text-stone-400 dark:text-stone-500">
          pong disabled — reduced motion
        </div>
      </div>
    );
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="fixed inset-0 z-50 pointer-events-none"
      />
      <div
        aria-hidden
        className="fixed top-4 left-1/2 z-50 -translate-x-1/2 pointer-events-none select-none text-center"
      >
        <div className="font-mono text-sm tabular-nums text-stone-500 dark:text-stone-400">
          CPU {score.cpu} · {score.you} YOU
        </div>
        {!started && (
          <div className="mt-1 font-mono text-[11px] text-stone-400 dark:text-stone-500">
            scroll to play — you are the scrollbar
          </div>
        )}
      </div>
    </>
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
