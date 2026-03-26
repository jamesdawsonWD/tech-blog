"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { motion } from "framer-motion";
import {
  User,
  Settings,
  LayoutGrid,
  Menu,
  Globe,
  ListChecks,
  MessageCircle,
  FileText,
} from "lucide-react";

const SCALE_PRESSED = 0.96;
const SPRING_STIFFNESS = 600;
const SPRING_DAMPING = 18;

// Change this to make the whole dial bigger/smaller
const DIAL_SCALE = 0.42;

export const ICONS = [
  { id: "profile", icon: User, opacity: 0.96, label: "Open profile" },
  { id: "settings", icon: Settings, opacity: 0.96, label: "Open settings" },
  { id: "workspace", icon: LayoutGrid, opacity: 0.96, label: "Open workspace" },
  { id: "menu", icon: Menu, opacity: 0.96, label: "Open main menu section" },
  {
    id: "globe",
    icon: Globe,
    opacity: 0.96,
    label: "Open website or global navigation",
  },
  { id: "tasks", icon: ListChecks, opacity: 0.96, label: "Open tasks" },
  { id: "chat", icon: MessageCircle, opacity: 0.96, label: "Open chat" },
  { id: "docs", icon: FileText, opacity: 0.96, label: "Open docs" },
] as const;

export type RadialSectionId = (typeof ICONS)[number]["id"];

function polarToCartesian(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: Math.cos(rad) * radius,
    y: Math.sin(rad) * radius,
  };
}

function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function polarToConic(angle: number) {
  return normalizeAngle(angle + 90);
}

type RadialButtonProps = {
  activeId: RadialSectionId;
  onSelect: (id: RadialSectionId) => void;
};

export default function RadialButton({
  activeId,
  onSelect,
}: RadialButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<RadialSectionId | null>(null);

  const [ringRotation] = useState(0);
  const [gapStart] = useState(342);
  const [gapEnd] = useState(19);
  const [activeStart] = useState(57);
  const [activeEnd] = useState(52);

  // Base design values
  const [ringSizeBase] = useState(470);
  const [ringInnerCutBase] = useState(158);
  const [plateSizeBase] = useState(286);
  const [buttonSizeBase] = useState(222);
  const [iconRadiusBase] = useState(196);

  const [shadowWidthBase] = useState(360);
  const [shadowHeightBase] = useState(56);
  const [shadowBlurBase] = useState(14);
  const [shadowOpacity] = useState(0.055);

  const [iconRotationOffset] = useState(0);
  const [iconVerticalOffsetBase] = useState(0);
  const [innerPairOffset] = useState(24);
  const [midInnerPairOffset] = useState(64);
  const [midOuterPairOffset] = useState(104);
  const [outerPairOffset] = useState(140);
  const [leftBias] = useState(0);
  const [rightBias] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const isMenuVisible = isHovered || isPinnedOpen;

  // Scaled values used for rendering
  const ringSize = ringSizeBase * DIAL_SCALE;
  const ringInnerCut = ringInnerCutBase * DIAL_SCALE;
  const plateSize = plateSizeBase * DIAL_SCALE;
  const buttonSize = buttonSizeBase * DIAL_SCALE;
  const iconRadius = iconRadiusBase * DIAL_SCALE;

  const shadowWidth = shadowWidthBase * DIAL_SCALE;
  const shadowHeight = shadowHeightBase * DIAL_SCALE;
  const shadowBlur = shadowBlurBase * DIAL_SCALE;
  const iconVerticalOffset = iconVerticalOffsetBase * DIAL_SCALE;

  // Visual icon size vs interactive focus area
  const iconButtonSize = 68 * DIAL_SCALE;
  const iconFocusAreaBase = 108;
  const iconFocusArea = iconFocusAreaBase * DIAL_SCALE;
  const iconSize = 28 * DIAL_SCALE;

  const hamburgerBarWidth = 56 * DIAL_SCALE;
  const hamburgerBarHeight = 6 * DIAL_SCALE;
  const hamburgerGap = 10 * DIAL_SCALE;

  const openMenu = () => {
    setIsHovered(true);
    setIsPinnedOpen(true);
  };

  const closeMenu = (restoreFocus = false) => {
    setIsHovered(false);
    setIsPinnedOpen(false);
    setHoveredId(null);

    if (restoreFocus) {
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  };

  const ringBackground = useMemo(() => {
    const normalizedGapStart = normalizeAngle(gapStart);
    const normalizedGapEnd = normalizeAngle(gapEnd);

    if (normalizedGapStart > normalizedGapEnd) {
      return `
        conic-gradient(
          from ${ringRotation}deg,
          transparent 0deg ${normalizedGapEnd}deg,
          #262626 ${normalizedGapEnd}deg ${normalizedGapStart}deg,
          transparent ${normalizedGapStart}deg 360deg
        )
      `;
    }

    return `
      conic-gradient(
        from ${ringRotation}deg,
        #262626 0deg ${normalizedGapStart}deg,
        transparent ${normalizedGapStart}deg ${normalizedGapEnd}deg,
        #262626 ${normalizedGapEnd}deg 360deg
      )
    `;
  }, [ringRotation, gapStart, gapEnd]);

  const iconAngles = useMemo(() => {
    const bottomAxis = 90;

    const leftOffsets = [
      outerPairOffset,
      midOuterPairOffset,
      midInnerPairOffset,
      innerPairOffset,
    ];

    const rightOffsets = [
      innerPairOffset,
      midInnerPairOffset,
      midOuterPairOffset,
      outerPairOffset,
    ];

    return [
      bottomAxis + leftOffsets[0] + iconRotationOffset + leftBias,
      bottomAxis + leftOffsets[1] + iconRotationOffset + leftBias,
      bottomAxis + leftOffsets[2] + iconRotationOffset + leftBias,
      bottomAxis + leftOffsets[3] + iconRotationOffset + leftBias,

      bottomAxis - rightOffsets[0] + iconRotationOffset + rightBias,
      bottomAxis - rightOffsets[1] + iconRotationOffset + rightBias,
      bottomAxis - rightOffsets[2] + iconRotationOffset + rightBias,
      bottomAxis - rightOffsets[3] + iconRotationOffset + rightBias,
    ];
  }, [
    iconRotationOffset,
    innerPairOffset,
    midInnerPairOffset,
    midOuterPairOffset,
    outerPairOffset,
    leftBias,
    rightBias,
  ]);

  const positionedItems = useMemo(
    () =>
      ICONS.map((item, index) => ({
        ...item,
        angle: iconAngles[index],
        conicAngle: polarToConic(iconAngles[index]),
      })),
    [iconAngles]
  );

  const highlightId = hoveredId ?? activeId;
  const activeItem =
    positionedItems.find((item) => item.id === highlightId) ?? positionedItems[7];

  const activeSegmentWidth = useMemo(() => {
    const width = normalizeAngle(activeStart - gapEnd);
    return Math.max(18, width || 38);
  }, [activeStart, gapEnd]);

  useEffect(() => {
    if (!isMenuVisible) return;

    const activeIndex = positionedItems.findIndex((item) => item.id === activeId);
    const fallbackIndex = activeIndex >= 0 ? activeIndex : 0;

    requestAnimationFrame(() => {
      itemRefs.current[fallbackIndex]?.focus();
    });
  }, [isMenuVisible, activeId, positionedItems]);

  useEffect(() => {
    if (!isMenuVisible) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuVisible]);

  const handleTrapTab = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!isMenuVisible || event.key !== "Tab") return;

    const focusableElements = [
      triggerRef.current,
      ...itemRefs.current.filter(Boolean),
    ].filter(Boolean) as HTMLButtonElement[];

    if (!focusableElements.length) return;

    const currentIndex = focusableElements.findIndex(
      (element) => element === document.activeElement
    );

    if (event.shiftKey) {
      if (currentIndex === 0 || currentIndex === -1) {
        event.preventDefault();
        focusableElements[focusableElements.length - 1]?.focus();
      }
      return;
    }

    if (currentIndex === focusableElements.length - 1) {
      event.preventDefault();
      focusableElements[0]?.focus();
    }
  };

  const handleSelect = (id: RadialSectionId) => {
    onSelect(id);
    closeMenu(true);
  };

  return (
    <motion.div
      ref={containerRef}
      className="relative"
      style={{ width: ringSize, height: ringSize }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => closeMenu(false)}
      onMouseLeave={() => closeMenu(false)}
      onKeyDown={handleTrapTab}
      initial={false}
      role="menu"
      aria-label="Radial navigation menu"
    >
      <motion.div
        className="absolute left-1/2 top-[92%] -translate-x-1/2 rounded-full"
        animate={{
          opacity: isMenuVisible ? shadowOpacity * 0.75 : shadowOpacity,
          scaleX: isMenuVisible ? 0.96 : 1,
          scaleY: isMenuVisible ? 0.9 : 1,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          width: shadowWidth,
          height: shadowHeight,
          background: `rgba(0,0,0,${shadowOpacity})`,
          filter: `blur(${shadowBlur}px)`,
        }}
      />

      <motion.div
        className="absolute inset-0 m-auto rounded-full origin-center"
        initial={false}
        animate={{
          opacity: isMenuVisible ? 1 : 0,
          scale: isMenuVisible ? 1 : buttonSize / ringSize,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          width: ringSize,
          height: ringSize,
        }}
        aria-hidden={!isMenuVisible}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={false}
          animate={{
            opacity: isMenuVisible ? 0.18 : 0,
            scale: isMenuVisible ? 1 : buttonSize / ringSize,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          style={{
            boxShadow: `0 ${28 * DIAL_SCALE}px ${55 * DIAL_SCALE}px rgba(0,0,0,0.16)`,
          }}
        />

        <motion.div
          className="absolute inset-0 rounded-full"
          initial={false}
          animate={{
            opacity: isMenuVisible ? 1 : 0.65,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          style={{
            background: ringBackground,
            WebkitMask: `radial-gradient(circle, transparent 0 ${ringInnerCut}px, black ${
              ringInnerCut + 1
            }px)`,
            mask: `radial-gradient(circle, transparent 0 ${ringInnerCut}px, black ${
              ringInnerCut + 1
            }px)`,
            filter: `drop-shadow(0 ${14 * DIAL_SCALE}px ${18 * DIAL_SCALE}px rgba(0,0,0,0.10))`,
          }}
        />

        <motion.div
          className="pointer-events-none absolute inset-0 rounded-full origin-center"
          initial={false}
          animate={{
            rotate: activeItem.conicAngle,
            opacity: isMenuVisible ? 1 : 0,
            scale: isMenuVisible ? 1 : 0.985,
          }}
          transition={{
            type: "spring",
            stiffness: 240,
            damping: 28,
            mass: 0.8,
          }}
          style={{
            WebkitMask: `conic-gradient(
              from ${-activeSegmentWidth / 2}deg,
              black 0deg ${activeSegmentWidth}deg,
              transparent ${activeSegmentWidth}deg 360deg
            )`,
            mask: `conic-gradient(
              from ${-activeSegmentWidth / 2}deg,
              black 0deg ${activeSegmentWidth}deg,
              transparent ${activeSegmentWidth}deg 360deg
            )`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "rgba(255,255,255,0.16)",
              WebkitMask: `radial-gradient(
                circle,
                transparent 0 ${ringInnerCut}px,
                black ${ringInnerCut + 1}px
              )`,
              mask: `radial-gradient(
                circle,
                transparent 0 ${ringInnerCut}px,
                black ${ringInnerCut + 1}px
              )`,
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.18),
                0 1px 2px rgba(0,0,0,0.08)
              `,
            }}
          />
        </motion.div>

        {positionedItems.map((item, index) => {
          const Icon = item.icon;
          const { x, y } = polarToCartesian(item.angle, iconRadius);
          const isActive = item.id === highlightId;

          return (
            <motion.button
              key={item.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role="menuitem"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              tabIndex={isMenuVisible ? 0 : -1}
              disabled={!isMenuVisible}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onMouseEnter={() => setHoveredId(item.id)}
              onFocus={() => {
                setHoveredId(item.id);
                openMenu();
              }}
              onClick={() => handleSelect(item.id)}
              className={[
                "absolute left-1/2 top-1/2 flex",
                "items-center justify-center rounded-full",
                "outline-none transition-shadow",
                !isMenuVisible ? "pointer-events-none" : "cursor-pointer",
              ].join(" ")}
              style={{
                width: iconFocusArea,
                height: iconFocusArea,
                marginLeft: x - iconFocusArea / 2,
                marginTop: y + iconVerticalOffset - iconFocusArea / 2,
              }}
              initial={false}
              animate={{
                opacity: isMenuVisible ? 1 : 0,
                scale: isMenuVisible ? 1 : 0.7,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 24,
              }}
            >
              <span
                className="relative flex items-center justify-center"
                style={{
                  width: iconButtonSize,
                  height: iconButtonSize,
                  background: "transparent",
                  boxShadow: "none",
                }}
              >
                <Icon
                  aria-hidden="true"
                  className="text-white"
                  style={{
                    width: iconSize,
                    height: iconSize,
                    opacity: item.opacity,
                    color: isActive ? "#ffffff" : "#f5f5f5",
                    filter: isActive
                      ? "drop-shadow(0 1px 2px rgba(0,0,0,0.45))"
                      : "drop-shadow(0 1px 1px rgba(0,0,0,0.35))",
                  }}
                  strokeWidth={2.2}
                />
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      <div
        className="absolute inset-0 m-auto rounded-full bg-[#efefef]"
        style={{
          width: plateSize,
          height: plateSize,
          boxShadow: `
            inset 0 ${2 * DIAL_SCALE}px 0 rgba(255,255,255,0.92),
            inset 0 -${12 * DIAL_SCALE}px ${24 * DIAL_SCALE}px rgba(0,0,0,0.035),
            0 ${10 * DIAL_SCALE}px ${30 * DIAL_SCALE}px rgba(0,0,0,0.05)
          `,
        }}
      />

      <motion.div
        className="absolute inset-0 m-auto rounded-full"
        initial={false}
        animate={{
          boxShadow: isMenuVisible
            ? `0 ${8 * DIAL_SCALE}px ${12 * DIAL_SCALE}px rgba(0,0,0,0.07)`
            : `0 ${26 * DIAL_SCALE}px ${34 * DIAL_SCALE}px rgba(0,0,0,0.14)`,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          width: buttonSize,
          height: buttonSize,
        }}
      />

      <motion.button
        ref={triggerRef}
        type="button"
        aria-label={isMenuVisible ? "Close radial navigation menu" : "Open radial navigation menu"}
        aria-haspopup="menu"
        aria-expanded={isMenuVisible}
        whileTap={{ scale: SCALE_PRESSED }}
        transition={{
          type: "spring",
          stiffness: SPRING_STIFFNESS,
          damping: SPRING_DAMPING,
        }}
        onClick={() => {
          if (isMenuVisible) {
            closeMenu(true);
          } else {
            openMenu();
          }
        }}
        onFocus={() => openMenu()}
        className="absolute inset-0 m-auto flex cursor-pointer items-center justify-center rounded-full border border-[#cfcfcf] bg-[#f3f3f3] outline-none"
        initial={false}
        animate={{
          scale: isMenuVisible ? 0.985 : 1,
          boxShadow: isMenuVisible
            ? `
              inset 0 ${2 * DIAL_SCALE}px 0 rgba(255,255,255,0.90),
              inset 0 -${3 * DIAL_SCALE}px ${8 * DIAL_SCALE}px rgba(0,0,0,0.035),
              0 ${1 * DIAL_SCALE}px ${2 * DIAL_SCALE}px rgba(0,0,0,0.015)
            `
            : `
              inset 0 ${2 * DIAL_SCALE}px 0 rgba(255,255,255,0.95),
              inset 0 -${8 * DIAL_SCALE}px ${14 * DIAL_SCALE}px rgba(0,0,0,0.04),
              0 ${2 * DIAL_SCALE}px ${6 * DIAL_SCALE}px rgba(0,0,0,0.03)
            `,
        }}
        style={{
          width: buttonSize,
          height: buttonSize,
        }}
      >
        <span className="sr-only">
          {isMenuVisible ? "Close menu" : "Open menu"}
        </span>

        <div
          aria-hidden="true"
          className="flex flex-col"
          style={{
            gap: hamburgerGap,
          }}
        >
          <span
            className="block rounded-full bg-[#555555]"
            style={{
              width: hamburgerBarWidth,
              height: hamburgerBarHeight,
            }}
          />
          <span
            className="block rounded-full bg-[#555555]"
            style={{
              width: hamburgerBarWidth,
              height: hamburgerBarHeight,
            }}
          />
          <span
            className="block rounded-full bg-[#555555]"
            style={{
              width: hamburgerBarWidth,
              height: hamburgerBarHeight,
            }}
          />
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            boxShadow: "0 0 0 0 transparent",
          }}
        />
      </motion.button>
    </motion.div>
  );
}
