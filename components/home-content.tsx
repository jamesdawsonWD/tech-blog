"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaXTwitter, FaGithub } from "react-icons/fa6";
import ArticleCard from "@/components/article-card";
import PhotoGallery from "@/components/photo-gallery";
import CVSection from "@/components/cv-section";

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
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{
            opacity: 0,
            x: isLeft ? 18 : -18,
            y: 8,
            rotate: isLeft ? -5 : 5,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            rotate: isLeft ? -3 : 3,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            x: isLeft ? 12 : -12,
            y: 6,
            rotate: isLeft ? -4 : 4,
            scale: 0.98,
          }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={[
            "pointer-events-none absolute top-1/2 z-50 hidden md:block",
            isLeft ? "right-full mr-4 -translate-y-1/2" : "left-full ml-4 -translate-y-1/2",
          ].join(" ")}
        >
          <div className="w-[220px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
            {children}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function MobilePhotoDrawer({
  show,
  children,
  onClose,
}: {
  show: boolean;
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <AnimatePresence>
      {show ? (
        <>
          <motion.button
            type="button"
            aria-label="Close photo preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%", opacity: 0.98 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 md:hidden"
          >
            <div className="rounded-t-[28px] border-t border-black/10 bg-[#f6f5ef] px-4 pb-6 pt-3 shadow-[0_-20px_60px_rgba(0,0,0,0.18)]">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-black/15" />
              <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
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
            isHovered || isFocused || isLocked ? "#000000" : "hsl(80, 12.30%, 85.70%)",
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`font-medium cursor-pointer !p-1 rounded text-foreground hover:!text-background border-0 inline-flex leading-none align-baseline ${
          shouldBlur ? "select-none" : ""
        } ${isLocked || isFocused ? "!text-background" : ""}`}
      >
        <WavyText text={label} />
      </motion.button>

      {preview ? (
        <DesktopHoverPhotoCard show={showPreview} side={previewSide}>
          {preview}
        </DesktopHoverPhotoCard>
      ) : null}
    </span>
  );
}

export default function HomeContent({ posts }: { posts: any[] }) {
  const [hoveredBioBadge, setHoveredBioBadge] = useState<BadgeKey>(null);
  const [activeBioBadge, setActiveBioBadge] = useState<BadgeKey>(null);
  const [hoveredNavView, setHoveredNavView] = useState<BadgeKey>(null);
  const bioRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeView = (searchParams.get("view") as BadgeKey) || null;
  
  const visibleBioBadge = hoveredBioBadge ?? activeBioBadge;
  const rightSectionView = activeView ?? hoveredNavView;

  const activeBioGalleryKey =
    activeBioBadge === "human-father" ||
    activeBioBadge === "dog-dad" ||
    activeBioBadge === "husband"
      ? activeBioBadge
      : null;

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

  const handleBadgeClick = (key: BadgeKey) => {
    const newView = activeView === key ? null : key;
    router.push(newView ? `/?view=${newView}` : "/", { scroll: false });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 md:gap-0 h-full px-8 xl:pl-24 pb-24 xl:pb-0">
      <div className="flex flex-col justify-between py-16 lg:py-24 md:pr-24 md:border-r border-[#F0F4EF]">
        <div>
          <p className="text-muted-foreground text-base font-extralight tracking-[0.53em] leading-[1.184] ml-1">
            Design Engineer
          </p>

          <div className="relative mt-[12px]">
            <div className="absolute top-1/2 right-full mr-4 w-[50vw] h-px bg-[#F0F4EF]" />
            <h1 className="font-inria-serif xl:text-[64px] text-[48px] font-bold italic tracking-[-0.0125em] leading-[1.184]">
              Hi, I&rsquo;m James.
            </h1>
          </div>

          <div
            ref={bioRef}
            className="mt-4 text-[#141414] text-base font-normal tracking-[-0.0125em] leading-[2] max-w-[420px]"
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
              previewSide="left"
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
              . For the last 10 years{" "}
              I have been Designing and Building web based software.
              I like to write about it all.
            </BlurrableSpan>
          </div>

          <nav
            className="flex gap-2 mt-16"
            role="tablist"
            aria-label="Content navigation"
          >
            <button
              role="tab"
              aria-selected={rightSectionView !== "last-10-years"}
              aria-controls="blog-content"
              id="blog-tab"
              onClick={() => {
                if (activeView === "last-10-years") {
                  router.push("/", { scroll: false });
                } else {
                  setHoveredNavView("write");
                }
              }}
              onFocus={() => setHoveredNavView("write")}
              onBlur={() => {
                if (activeView !== "write") {
                  setHoveredNavView(null);
                }
              }}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-colors
                focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background
                ${
                  rightSectionView !== "last-10-years"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              Blog
            </button>

            <button
              role="tab"
              aria-selected={rightSectionView === "last-10-years"}
              aria-controls="experience-content"
              id="experience-tab"
              onClick={() => handleBadgeClick("last-10-years")}
              onFocus={() => setHoveredNavView("last-10-years")}
              onBlur={() => {
                if (activeView !== "last-10-years") {
                  setHoveredNavView(null);
                }
              }}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-colors
                focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background
                ${
                  rightSectionView === "last-10-years"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              Experience
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4 mt-12">
          <a
            href="https://x.com/jamesdawson_x"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow James on X (formerly Twitter)"
            className="text-foreground hover:text-muted-foreground transition-colors"
          >
            <FaXTwitter size={18} />
          </a>
          <a
            href="https://github.com/jamesdawsonWD"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View James's GitHub profile"
            className="text-foreground hover:text-muted-foreground transition-colors"
          >
            <FaGithub size={18} />
          </a>
        </div>
      </div>

      <div className="relative p-0 xl:p-24" role="region" aria-label="Content area">
        <AnimatePresence mode="wait">
          {rightSectionView === "last-10-years" ? (
            <CVSection key="cv" />
          ) : (
            <div key="blog" className="h-full overflow-y-auto max-w-lg xl:max-w-none">
              <div className="space-y-10">
                {posts.map((post) => (
                  <ArticleCard key={post.slug} post={post} />
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}