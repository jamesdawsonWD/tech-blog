"use client";

import { motion } from "framer-motion";
import { Clock, Pause, Play } from "lucide-react";

export function MiniPlayer({
  isPlaying,
  onTogglePlay,
  trackName,
  albumArt,
  onExpandTo,
}: {
  isPlaying: boolean;
  onTogglePlay: () => void;
  trackName: string;
  albumArt: string;
  onExpandTo: (view: "player" | "timer" | "cv") => void;
}) {
  return (
    <div className="flex h-[44px] items-center gap-2 px-2.5">
      {/* Music section */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
          onExpandTo("player");
        }}
        className="flex flex-1 items-center gap-2 overflow-hidden rounded-lg px-1 py-1"
      >
        <div className="relative shrink-0">
          <img
            src={albumArt}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
          />
          <div
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40"
          >
            {isPlaying ? (
              <Pause size={10} className="text-white" fill="white" />
            ) : (
              <Play size={10} className="ml-0.5 text-white" fill="white" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 overflow-hidden">
          {isPlaying && <SoundBars />}
          <span className="truncate text-xs font-medium text-white/90">
            {trackName}
          </span>
        </div>
      </motion.button>

      {/* Divider */}
      <div className="h-4 w-px shrink-0 bg-white/10" />

      {/* Timer icon */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={(e) => {
          e.stopPropagation();
          onExpandTo("timer");
        }}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
      >
        <Clock size={14} />
      </motion.button>

      {/* CV label */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={(e) => {
          e.stopPropagation();
          onExpandTo("cv");
        }}
        className="shrink-0 rounded-full px-2 py-1 text-[11px] font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
      >
        CV
      </motion.button>
    </div>
  );
}

function SoundBars() {
  return (
    <div className="flex h-3 items-end gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full bg-green-400"
          animate={{
            height: ["4px", "12px", "6px", "10px", "4px"],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
