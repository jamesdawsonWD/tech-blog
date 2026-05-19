"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import WavyText from "./wavy-text";
import DesktopHoverPhotoCard from "./desktop-hover-photo-card";
import MobileInlinePhotoCard from "./mobile-inline-photo-card";
import type { BadgeKey, PreviewSide } from "./badge-types";

// HSL values mirror the design tokens (--foreground / --secondary) so the
// framer-motion colour animation stays in sync with the theme.
const FOREGROUND_HSL = "hsl(20, 14.3%, 4.1%)";
const SECONDARY_HSL = "hsl(78, 28%, 93%)";

export default function Badge({
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
        aria-expanded={showPreview}
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
              ? FOREGROUND_HSL
              : SECONDARY_HSL,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`cursor-pointer rounded bg-secondary border-0 !p-1 font-medium leading-none text-foreground hover:!text-background ${
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
