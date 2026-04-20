"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ArticleCard from "@/components/article-card";
import ShowcaseCard from "@/components/showcase-card";
import PhotoGallery from "@/components/photo-gallery";
import ScrambleText from "@/components/scramble-text";

const BADGES = [
  { label: "Dog Dad", key: "dog-dad" },
  { label: "Human Father", key: "human-father" },
  { label: "Husband", key: "husband" },
  { label: "Tinkerer", key: "tinkerer" },
  { label: "designing and building", key: "designing-building" },
] as const;

type BadgeKey =
  | (typeof BADGES)[number]["key"]
  | "write"
  | "cv"
  | "contact"
  | "last-10-years"
  | null;

type PreviewSide = "left" | "right";

const PHOTO_PRELOADS = [
  "/IMG-20250528-WA0009.jpg",
  "/IMG-20250922-WA0003.jpg",
  "/PXL_20210611_111843853-ANIMATION.gif",
];

function PhotoPreloader() {
  useEffect(() => {
    PHOTO_PRELOADS.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      img.decode?.().catch(() => {});
    });
  }, []);

  return null;
}

function BlurrableSpan({
  children,
  hoveredBadge,
  badgeKey,
}: {
  children: ReactNode;
  hoveredBadge: BadgeKey;
  badgeKey: BadgeKey;
}) {
  const shouldBlur = hoveredBadge && badgeKey !== hoveredBadge;

  return (
    <motion.span
      animate={{
        opacity: shouldBlur ? 0.45 : 1,
        filter: shouldBlur ? "blur(1.5px)" : "blur(0px)",
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={shouldBlur ? "select-none" : ""}
    >
      {children}
    </motion.span>
  );
}

function WavyText({ text }: { text: string }) {
  return (
    <span className="wavy-text inline-flex leading-none">
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{ ["--wavy-delay" as string]: `${i * 30}ms` }}
          className={
            char === " " ? "inline-block w-[0.25em]" : "wavy-letter inline-block"
          }
        >
          {char}
        </span>
      ))}
    </span>
  );
}

function DesktopHoverPhotoCard({
  show,
  side = "right",
  children,
}: {
  show: boolean;
  side?: PreviewSide;
  children: ReactNode;
}) {
  const isLeft = side === "left";

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: show ? 1 : 0,
        x: show ? 0 : isLeft ? 18 : -18,
        y: show ? 0 : 8,
        rotate: show ? (isLeft ? -3 : 3) : isLeft ? -5 : 5,
        scale: show ? 1 : 0.96,
      }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{ pointerEvents: show ? "auto" : "none" }}
      aria-hidden={!show}
      className={[
        "absolute top-1/2 z-50 hidden md:block",
        isLeft
          ? "right-full mr-4 -translate-y-1/2"
          : "left-full ml-4 -translate-y-1/2",
      ].join(" ")}
    >
      <div className="w-[220px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
        {children}
      </div>
    </motion.div>
  );
}

function MobileInlinePhotoCard({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute left-0 top-full z-40 mt-3 block md:hidden"
        >
          <div className="w-[170px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_14px_40px_rgba(0,0,0,0.14)]">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Badge({
  label,
  badgeKey,
  hoveredBadge,
  isLocked = false,
  preview,
  previewSide = "right",
  onHover,
  onLeave,
  onClick,
  onFocus,
  onBlur,
}: {
  label: string;
  badgeKey: BadgeKey;
  hoveredBadge: BadgeKey;
  isLocked?: boolean;
  preview?: ReactNode;
  previewSide?: PreviewSide;
  onHover?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const shouldBlur = hoveredBadge && badgeKey !== hoveredBadge;
  const isHovered = hoveredBadge === badgeKey;
  const showPreview = isHovered || isFocused || isLocked;

  return (
    <span className="relative inline-flex align-baseline">
      <motion.button
        type="button"
        data-badge
        aria-pressed={isLocked}
        aria-label={`View ${label}`}
        onFocus={() => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onClick={onClick}
        animate={{
          backgroundColor:
            isHovered || isFocused || isLocked
              ? "#000000"
              : "#dcdfd6",
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`cursor-pointer rounded bg-[#dcdfd6] border-0 !p-1 font-medium leading-none text-foreground hover:!text-background ${
          shouldBlur ? "select-none" : ""
        } ${isLocked || isFocused ? "!text-background" : ""}`}
      >
        <WavyText text={label} />
      </motion.button>

      {preview ? (
        <>
          <DesktopHoverPhotoCard show={showPreview} side={previewSide}>
            {preview}
          </DesktopHoverPhotoCard>

          <MobileInlinePhotoCard show={showPreview}>
            {preview}
          </MobileInlinePhotoCard>
        </>
      ) : null}
    </span>
  );
}

export default function HomeContent({ posts }: { posts: any[] }) {
  const [hoveredBioBadge, setHoveredBioBadge] = useState<BadgeKey>(null);
  const [activeBioBadge, setActiveBioBadge] = useState<BadgeKey>(null);
  const bioRef = useRef<HTMLDivElement | null>(null);

  const visibleBioBadge = hoveredBioBadge ?? activeBioBadge;

  const SHOWCASE_ORDER = [
    "radial-menu-button",
    "moon-beam-toggle",
    "pixel-recaptcha-game",
    "exploring-friction-patterns-can-save-you-millions",
  ];
  const showcasePosts = posts
    .filter((p) => p.showcase)
    .sort(
      (a, b) =>
        (SHOWCASE_ORDER.indexOf(a.slug) === -1 ? 999 : SHOWCASE_ORDER.indexOf(a.slug)) -
        (SHOWCASE_ORDER.indexOf(b.slug) === -1 ? 999 : SHOWCASE_ORDER.indexOf(b.slug))
    );
  const articlePosts = posts.filter((p) => !p.showcase);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!bioRef.current) return;

      const target = event.target as Node;
      if (!bioRef.current.contains(target)) {
        setActiveBioBadge(null);
        setHoveredBioBadge(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <>
      <PhotoPreloader />

      <div className="mx-auto max-w-[692px] px-6 py-20 sm:py-28">
        {/* Bio */}
        <div className="px-4">
          <p className="text-base font-extralight leading-[1.184] tracking-[0.53em] text-muted-foreground">
            <ScrambleText />
          </p>

          <h1 className="mt-3 font-inria-serif text-[32px] font-bold italic leading-[1.184] tracking-[-0.0125em] sm:text-[48px]">
            Hi, I&rsquo;m James.
          </h1>

          <div
            ref={bioRef}
            className="mt-4 text-base font-normal leading-[2] tracking-[-0.0125em] text-[#141414]"
          >
            <BlurrableSpan hoveredBadge={visibleBioBadge} badgeKey={null}>
              A very recent{" "}
            </BlurrableSpan>

            <Badge
              label="Human Dad"
              badgeKey="human-father"
              hoveredBadge={visibleBioBadge}
              isLocked={activeBioBadge === "human-father"}
              previewSide="right"
              preview={<PhotoGallery galleryKey="human-father" />}
              onHover={() => setHoveredBioBadge("human-father")}
              onLeave={() => setHoveredBioBadge(null)}
              onFocus={() => setHoveredBioBadge("human-father")}
              onBlur={() => setHoveredBioBadge(null)}
              onClick={() =>
                setActiveBioBadge((current) =>
                  current === "human-father" ? null : "human-father"
                )
              }
            />

            <BlurrableSpan hoveredBadge={visibleBioBadge} badgeKey={null}>
              , a less recent{" "}
            </BlurrableSpan>

            <Badge
              label="Dog Dad"
              badgeKey="dog-dad"
              hoveredBadge={visibleBioBadge}
              isLocked={activeBioBadge === "dog-dad"}
              previewSide="right"
              preview={<PhotoGallery galleryKey="dog-dad" />}
              onHover={() => setHoveredBioBadge("dog-dad")}
              onLeave={() => setHoveredBioBadge(null)}
              onFocus={() => setHoveredBioBadge("dog-dad")}
              onBlur={() => setHoveredBioBadge(null)}
              onClick={() =>
                setActiveBioBadge((current) =>
                  current === "dog-dad" ? null : "dog-dad"
                )
              }
            />

            <BlurrableSpan hoveredBadge={visibleBioBadge} badgeKey={null}>
              {" "}and a{" "}
            </BlurrableSpan>

            <Badge
              label="Husband-to-be"
              badgeKey="husband"
              hoveredBadge={visibleBioBadge}
              isLocked={activeBioBadge === "husband"}
              previewSide="left"
              preview={<PhotoGallery galleryKey="husband" />}
              onHover={() => setHoveredBioBadge("husband")}
              onLeave={() => setHoveredBioBadge(null)}
              onFocus={() => setHoveredBioBadge("husband")}
              onBlur={() => setHoveredBioBadge(null)}
              onClick={() =>
                setActiveBioBadge((current) =>
                  current === "husband" ? null : "husband"
                )
              }
            />

            <BlurrableSpan hoveredBadge={visibleBioBadge} badgeKey={null}>
              . For the last <strong>10 years</strong> I have been <strong>Designing and Building</strong> web
              based software. 
            </BlurrableSpan>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <a
              href="https://x.com/jamesdawsonx"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow James on X (formerly Twitter)"
              className="text-foreground transition-colors hover:text-muted-foreground"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com/jamesdawsonWD"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View James's GitHub profile"
              className="text-foreground transition-colors hover:text-muted-foreground"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/james-dawson-245707174/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View James's Linkedin profile"
              className="text-foreground transition-colors hover:text-muted-foreground"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Showcase */}
        {showcasePosts.length > 0 && (
          <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {showcasePosts.map((post) => (
              <ShowcaseCard key={post.slug} post={post} />
            ))}
          </section>
        )}

        {/* Articles */}
        <section className="mt-12 space-y-1">
          {articlePosts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </section>
      </div>
    </>
  );
}
