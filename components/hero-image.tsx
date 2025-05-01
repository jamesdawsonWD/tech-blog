"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

type HeroImageProps = {
  src: string;
  alt: string;
  layoutId?: string;
};

export default function HeroImage({ src, alt }: HeroImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <AnimatePresence>
      <motion.div
        className="mb-8 overflow-hidden rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={630}
          className="w-full object-cover"
          priority
          onLoad={() => setLoaded(true)}
        />
      </motion.div>
    </AnimatePresence>
  );
}
