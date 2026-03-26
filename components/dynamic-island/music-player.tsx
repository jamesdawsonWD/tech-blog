"use client";

import { motion } from "framer-motion";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function MusicPlayer({
  isPlaying,
  onTogglePlay,
  trackName,
  artist,
  albumArt,
  audioRef,
  onSkip,
}: {
  isPlaying: boolean;
  onTogglePlay: () => void;
  trackName: string;
  artist: string;
  albumArt: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onSkip: (direction: "next" | "prev") => void;
}) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
      }
    };

    const onMetadata = () => setDuration(audio.duration);
    const onEnded = () => onSkip("next");

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", onMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", onMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioRef, onSkip]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar) return;

    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(!isMuted);
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex w-72 flex-col gap-3 px-4 py-4">
      <div className="flex items-center gap-3">
        <img
          src={albumArt}
          alt=""
          className="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-white">
            {trackName}
          </span>
          <span className="block truncate text-xs text-white/50">
            {artist}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          className="shrink-0 text-white/60 hover:text-white"
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </motion.button>
      </div>

      <div
        ref={progressRef}
        onClick={(e) => {
          e.stopPropagation();
          handleSeek(e);
        }}
        className="group relative h-1 cursor-pointer rounded-full bg-white/20"
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-white"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100"
          style={{ left: `${progress}%`, marginLeft: -6 }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-white/50">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="flex items-center justify-center gap-6">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            onSkip("prev");
          }}
          className="text-white/60 hover:text-white"
        >
          <SkipBack size={18} fill="currentColor" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          {isPlaying ? (
            <Pause size={18} className="text-black" fill="black" />
          ) : (
            <Play size={18} className="ml-0.5 text-black" fill="black" />
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            onSkip("next");
          }}
          className="text-white/60 hover:text-white"
        >
          <SkipForward size={18} fill="currentColor" />
        </motion.button>
      </div>
    </div>
  );
}
