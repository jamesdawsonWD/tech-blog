"use client";

import { useState, useEffect, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

const TITLES = [
  "Design Engineer",
  "Frontend Engineer",
  "Web Developer",
  "Landing Page Designer",
  "Product Engineer",
];

const CYCLE_INTERVAL = 2750;
const TICK_SPEED = 35;
const SCRAMBLE_COUNT = 3;
const STAGGER_MS = 60;

export default function ScrambleText() {
  const [display, setDisplay] = useState(TITLES[0]);
  const indexRef = useRef(0);
  const animatingRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const scrambleTo = (target: string) => {
      if (animatingRef.current) return;
      animatingRef.current = true;

      const maxLen = Math.max(target.length, display.length);
      const settled: boolean[] = new Array(maxLen).fill(false);
      const scrambledCount: number[] = new Array(maxLen).fill(0);
      const current = Array.from({ length: maxLen }, (_, i) =>
        i < display.length ? display[i] : " "
      );

      // Each character settles after SCRAMBLE_COUNT random ticks,
      // staggered so earlier characters finish first
      const settleAfter = (i: number) =>
        SCRAMBLE_COUNT + Math.round((i * STAGGER_MS) / TICK_SPEED);

      let step = 0;

      const tick = () => {
        step++;
        let allDone = true;

        for (let i = 0; i < maxLen; i++) {
          if (settled[i]) continue;
          allDone = false;

          if (step >= settleAfter(i)) {
            current[i] = i < target.length ? target[i] : "";
            settled[i] = true;
          } else {
            // Keep spaces as spaces
            const targetChar = i < target.length ? target[i] : " ";
            current[i] =
              targetChar === " "
                ? " "
                : CHARS[Math.floor(Math.random() * CHARS.length)];
            scrambledCount[i]++;
          }
        }

        setDisplay(current.join("").trimEnd());

        if (allDone) {
          setDisplay(target);
          animatingRef.current = false;
          return;
        }

        tickRef.current = setTimeout(tick, TICK_SPEED);
      };

      tick();
    };

    const id = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % TITLES.length;
      scrambleTo(TITLES[indexRef.current]);
    }, CYCLE_INTERVAL);

    return () => {
      clearInterval(id);
      if (tickRef.current) clearTimeout(tickRef.current);
      animatingRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{display}</>;
}
