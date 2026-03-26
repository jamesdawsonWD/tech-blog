"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaXTwitter, FaGithub, FaLinkedin } from "react-icons/fa6";
import ArticleCard from "@/components/article-card";
import ShowcaseCard from "@/components/showcase-card";
import PhotoGallery from "@/components/photo-gallery";

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
  "/images/human-father/1.jpg",
  "/images/dog-dad/1.jpg",
  "/images/husband/1.jpg",
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="inline-flex leading-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          animate={isHovered ? { y: [0, -4, 0] } : { y: 0 }}
          transition={
            isHovered
              ? { duration: 0.3, delay: i * 0.03, ease: "easeInOut" }
              : { duration: 0.1, delay: 0, ease: "easeOut" }
          }
          className={char === " " ? "inline-block w-[0.25em]" : "inline-block"}
        >
          {char}
        </motion.span>
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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [leftGradientOpacity, setLeftGradientOpacity] = useState(0);
  const [rightGradientOpacity, setRightGradientOpacity] = useState(0);

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

  const updateGradients = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const FADE_DISTANCE = 60;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setLeftGradientOpacity(Math.min(el.scrollLeft / FADE_DISTANCE, 1));
    setRightGradientOpacity(Math.min((maxScroll - el.scrollLeft) / FADE_DISTANCE, 1));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateGradients();
    el.addEventListener("scroll", updateGradients, { passive: true });
    window.addEventListener("resize", updateGradients);
    return () => {
      el.removeEventListener("scroll", updateGradients);
      window.removeEventListener("resize", updateGradients);
    };
  }, [updateGradients]);

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

      <div className="mx-auto max-w-[692px] px-6 py-20 sm:py-24">
        {/* Bio */}
        <div>
          <p className="text-base font-extralight leading-[1.184] tracking-[0.53em] text-muted-foreground">
            Design Engineer
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
              previewSide="right"
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
              <FaXTwitter size={18} />
            </a>
            <a
              href="https://github.com/jamesdawsonWD"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View James's GitHub profile"
              className="text-foreground transition-colors hover:text-muted-foreground"
            >
              <FaGithub size={18} />
            </a>
            <a
              href="https://www.linkedin.com/in/james-dawson-245707174/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View James's Linkedin profile"
              className="text-foreground transition-colors hover:text-muted-foreground"
            >
              <FaLinkedin size={18} />
            </a>
          </div>
        </div>

        {/* Showcase */}
        {showcasePosts.length > 0 && (
          <section className="relative -mx-6 mt-16">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent"
              style={{ opacity: leftGradientOpacity }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent"
              style={{ opacity: rightGradientOpacity }}
            />
            <div
              ref={scrollRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 scrollbar-none"
            >
              {showcasePosts.map((post) => (
                <ShowcaseCard key={post.slug} post={post} />
              ))}
            </div>
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
