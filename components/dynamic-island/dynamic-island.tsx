"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import {
  motion,
  useDragControls,
} from "framer-motion";
import { MiniPlayer } from "./mini-player";
import { MusicPlayer } from "./music-player";
import { TimerView } from "./timer-view";
import { CVView } from "./cv-view";

type View = "mini" | "player" | "timer" | "cv";

interface Track {
  name: string;
  artist: string;
  src: string;
  albumArt: string;
}

const TRACKS: Track[] = [
  {
    name: "Lofi Music",
    artist: "Lemon Music Lab",
    src: "/audio/lofi-music.mp3",
    albumArt:
      "https://cdn.pixabay.com/user/2026/03/09/19-04-19-721_96x96.jpg",
  },
  {
    name: "Lofi Study",
    artist: "FASSounds",
    src: "/audio/lofi-study.mp3",
    albumArt:
      "https://cdn.pixabay.com/user/2026/03/09/19-04-19-721_96x96.jpg",
  },
  {
    name: "Lofi Chill",
    artist: "MondaMusic",
    src: "/audio/lofi-chill.mp3",
    albumArt:
      "https://cdn.pixabay.com/user/2026/03/09/19-04-19-721_96x96.jpg",
  },
];

// Bounce amount per transition — smaller views need more bounce to be noticeable,
// larger views need less so they don't overshoot.
const BOUNCE_VARIANTS: Record<string, number> = {
  mini: 0.5,
  "mini-player": 0.45,
  "mini-timer": 0.45,
  "mini-cv": 0.4,
  "player-mini": 0.5,
  "player-timer": 0.4,
  "player-cv": 0.35,
  "timer-mini": 0.5,
  "timer-player": 0.4,
  "timer-cv": 0.35,
  "cv-mini": 0.5,
  "cv-player": 0.4,
  "cv-timer": 0.4,
};

export default function DynamicIsland() {
  const [view, setView] = useState<View>("mini");
  const [prevView, setPrevView] = useState<View>("mini");
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const constraintsRef = useRef<HTMLDivElement | null>(null);
  const islandRef = useRef<HTMLDivElement | null>(null);
  const dragControls = useDragControls();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Until we know the screen size, treat as mobile (no blur, no layout animation)
  // to avoid the flash-of-blur on hydration
  const simplifyAnimations = isMobile !== false;

  const track = TRACKS[trackIndex];

  const variantKey = prevView === view ? view : `${prevView}-${view}`;
  const bounce = BOUNCE_VARIANTS[variantKey] ?? 0.4;

  const changeView = useCallback(
    (next: View) => {
      setPrevView(view);
      setView(next);
    },
    [view]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const skipTrack = useCallback(
    (direction: "next" | "prev") => {
      const next =
        direction === "next"
          ? (trackIndex + 1) % TRACKS.length
          : (trackIndex - 1 + TRACKS.length) % TRACKS.length;
      setTrackIndex(next);

      const audio = audioRef.current;
      if (audio) {
        audio.src = TRACKS[next].src;
        audio.currentTime = 0;
        const playWhenReady = () => {
          audio.play().catch(() => {});
          audio.removeEventListener("canplay", playWhenReady);
        };
        audio.addEventListener("canplay", playWhenReady);
        audio.load();
        setIsPlaying(true);
      }
    },
    [trackIndex, isPlaying]
  );

  // Click outside to collapse
  useEffect(() => {
    if (view === "mini") return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        islandRef.current &&
        !islandRef.current.contains(e.target as Node)
      ) {
        changeView("mini");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [view, changeView]);

  const expandTo = useCallback(
    (target: "player" | "timer" | "cv") => {
      changeView(target);
    },
    [changeView]
  );

  const content = useMemo(() => {
    switch (view) {
      case "mini":
        return (
          <MiniPlayer
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            trackName={track.name}
            albumArt={track.albumArt}
            onExpandTo={expandTo}
          />
        );
      case "player":
        return (
          <MusicPlayer
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            trackName={track.name}
            artist={track.artist}
            albumArt={track.albumArt}
            audioRef={audioRef}
            onSkip={skipTrack}
          />
        );
      case "timer":
        return <TimerView />;
      case "cv":
        return <CVView onClose={() => changeView("mini")} />;
    }
  }, [
    view,
    isPlaying,
    togglePlay,
    track,
    expandTo,
    skipTrack,
    changeView,
  ]);

  return (
    <>
      <audio ref={audioRef} src={track.src} preload="metadata" />

      <div
        ref={constraintsRef}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
        <motion.div
          drag={!simplifyAnimations}
          dragControls={simplifyAnimations ? undefined : dragControls}
          dragMomentum={false}
          dragConstraints={simplifyAnimations ? undefined : constraintsRef}
          dragElastic={0.075}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            bounce: 0.4,
            duration: 0.8,
            delay: 0.3,
          }}
          className={`pointer-events-auto w-fit ${simplifyAnimations ? "" : "cursor-grab active:cursor-grabbing"}`}
          style={simplifyAnimations ? undefined : { touchAction: "none" }}
        >
          {/* The island container — layout animates width & height with spring on desktop,
              snaps instantly on mobile to avoid layout thrashing */}
          <motion.div
            ref={islandRef}
            layout={!simplifyAnimations}
            transition={{
              layout: {
                type: "spring",
                bounce,
                duration: 0.7,
              },
            }}
            style={{ borderRadius: 28 }}
            className="relative overflow-hidden bg-black shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          >
            {/* Active view — full spring entrance on desktop,
                simple fade on mobile (opacity-only = GPU composited) */}
            <motion.div
              key={view}
              transition={
                simplifyAnimations
                  ? { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
                  : { type: "spring", bounce }
              }
              initial={
                simplifyAnimations
                  ? { opacity: 0, filter: "blur(0px)" }
                  : {
                      scale: 0.9,
                      opacity: 0,
                      filter: "blur(5px)",
                      originX: 0.5,
                      originY: 0.5,
                    }
              }
              animate={
                simplifyAnimations
                  ? { opacity: 1, filter: "blur(0px)" }
                  : {
                      scale: 1,
                      opacity: 1,
                      filter: "blur(0px)",
                      originX: 0.5,
                      originY: 0.5,
                      transition: { delay: 0.05 },
                    }
              }
            >
              {content}
            </motion.div>
          </motion.div>

        </motion.div>
        </div>
      </div>
    </>
  );
}
