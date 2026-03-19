"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FaXTwitter, FaGithub, FaLinkedin } from "react-icons/fa6";
import { Download } from "lucide-react";
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

function ContentNav({
  activeView,
  rightSectionView,
  router,
  floating = false,
}: {
  activeView: BadgeKey;
  rightSectionView: BadgeKey;
  router: ReturnType<typeof useRouter>;
  floating?: boolean;
}) {
  return (
    <motion.div
      layout
      className={
        floating
          ? "pointer-events-auto flex items-center gap-3"
          : "flex items-center gap-3"
      }
      transition={{
        layout: {
          type: "spring",
          stiffness: 380,
          damping: 32,
          mass: 0.85,
        },
      }}
    >
      <motion.nav
        layout
        role="tablist"
        aria-label="Content navigation"
        className="inline-flex items-center rounded-full bg-[#F0F4EF]/80 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm"
        transition={{
          layout: {
            type: "spring",
            stiffness: 380,
            damping: 32,
            mass: 0.85,
          },
        }}
      >
        {[
          { label: "Blog", key: "blog" },
          { label: "Experience", key: "experience" },
        ].map((item) => {
          const active =
            item.key === "blog"
              ? activeView !== "last-10-years"
              : activeView === "last-10-years";

          return (
            <motion.button
              layout
              key={item.key}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls={
                item.key === "blog" ? "blog-content" : "experience-content"
              }
              id={`${item.key}-tab`}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (item.key === "blog") {
                  router.push("/", { scroll: false });
                } else {
                  router.push("/?view=last-10-years", { scroll: false });
                }
              }}
              className={`relative cursor-pointer rounded-full px-5 py-2.5 text-sm transition-colors ${
                active ? "text-background" : "text-muted-foreground"
              }`}
              transition={{
                layout: {
                  type: "spring",
                  stiffness: 380,
                  damping: 32,
                  mass: 0.85,
                },
              }}
            >
              {active && (
                <motion.span
                  layoutId={
                    floating ? "mode-pill-floating" : "mode-pill-inline"
                  }
                  className="absolute inset-0 rounded-full bg-foreground shadow-[0_8px_24px_rgba(20,20,20,0.08)]"
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 34,
                    mass: 0.8,
                  }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </motion.button>
          );
        })}
      </motion.nav>

      <AnimatePresence mode="popLayout" initial={false}>
        {rightSectionView === "last-10-years" && (
          <motion.a
            layout
            key={floating ? "download-cv-floating" : "download-cv-inline"}
            initial={{ opacity: 0, x: -8, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.96 }}
            transition={{
              layout: {
                type: "spring",
                stiffness: 380,
                damping: 32,
                mass: 0.85,
              },
              opacity: { duration: 0.16 },
              x: { duration: 0.2, ease: "easeOut" },
              scale: { duration: 0.16 },
            }}
            href="/cv.pdf"
            download="james-dawson-cv.pdf"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2.5 text-sm text-muted-foreground shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md transition-colors hover:text-foreground"
          >
            <Download size={16} />
            <span className="hidden md:block">Download CV</span>
            <span className="block md:hidden">Download</span>
          </motion.a>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HomeContent({ posts }: { posts: any[] }) {
  const [hoveredBioBadge, setHoveredBioBadge] = useState<BadgeKey>(null);
  const [activeBioBadge, setActiveBioBadge] = useState<BadgeKey>(null);
  const bioRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeView = (searchParams.get("view") as BadgeKey) || null;

  const visibleBioBadge = hoveredBioBadge ?? activeBioBadge;
  const rightSectionView = activeView ?? "write";

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

      <div className="grid h-full grid-cols-1 gap-12 px-8 pb-24 xl:grid-cols-2 xl:gap-0 xl:pl-24 xl:pb-0">
        <div className="flex flex-col justify-between border-[#F0F4EF] py-16 md:border-r md:pr-24 lg:py-24">
          <div>
            <p className="ml-1 text-base font-extralight leading-[1.184] tracking-[0.53em] text-muted-foreground">
              Design Engineer
            </p>

            <div className="relative mt-[12px]">
              <div className="absolute top-1/2 right-full mr-4 h-px w-[50vw] bg-[#F0F4EF]" />
              <h1 className="font-inria-serif text-[48px] font-bold italic leading-[1.184] tracking-[-0.0125em] xl:text-[64px]">
                Hi, I&rsquo;m James.
              </h1>
            </div>

            <div
              ref={bioRef}
              className="mt-4 max-w-[420px] text-base font-normal leading-[2] tracking-[-0.0125em] text-[#141414]"
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
                . For the last 10 years I have been Designing and Building web
                based software. I like to write about it all.
              </BlurrableSpan>
            </div>
          </div>

          <div className="mt-12">
            <div className="flex items-center gap-4">
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

            <div className="mt-16 xl:hidden">
              <ContentNav
                activeView={activeView}
                rightSectionView={rightSectionView}
                router={router}
              />
            </div>
          </div>
        </div>

        <div
          className="relative flex h-full min-h-0 flex-col p-0 xl:p-24"
          role="region"
          aria-label="Content area"
        >
          <div className="min-h-0 flex-1">
            {rightSectionView === "last-10-years" ? (
              <div
                id="experience-content"
                className="h-full overflow-y-auto pr-2 pb-28"
              >
                <CVSection key="cv" />
              </div>
            ) : (
              <div
                key="blog-content"
                id="blog-content"
                className="h-full overflow-y-auto pr-2 pb-28"
              >
                <div className="max-w-lg space-y-10 xl:max-w-none">
                  {posts.map((post) => (
                    <ArticleCard key={post.slug} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              layout
              className="pointer-events-none absolute inset-x-0 bottom-6 z-50 hidden justify-center xl:flex"
              transition={{
                layout: {
                  type: "spring",
                  stiffness: 380,
                  damping: 32,
                  mass: 0.85,
                },
              }}
            >
              <ContentNav
                activeView={activeView}
                rightSectionView={rightSectionView}
                router={router}
                floating
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}