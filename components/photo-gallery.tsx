"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type GalleryItem = {
  src: string;
  alt: string;
  className?: string;
};

const DOG_DAD_PHOTOS: GalleryItem[] = [
  {
    src: "/IMG-20250922-WA0003.jpg",
    alt: "Dog sitting on a cobblestone bridge",
    className: "row-span-2",
  },

];

const HUMAN_FATHER_PHOTOS: GalleryItem[] = [
  {
    src: "/IMG-20250528-WA0009.jpg",
    alt: "Father holding a newborn baby",
  },
];

const HUSBAND_PHOTOS: GalleryItem[] = [
  {
    src: "/PXL_20210611_111843853-ANIMATION.gif",
    alt: "Couple taking a selfie in a distorted reflective surface",
  },
];

const GALLERIES: Record<string, GalleryItem[]> = {
  "dog-dad": DOG_DAD_PHOTOS,
  "human-father": HUMAN_FATHER_PHOTOS,
  "husband": HUSBAND_PHOTOS,
};

export default function PhotoGallery({ galleryKey }: { galleryKey: string }) {
  const photos = GALLERIES[galleryKey];
  if (!photos) return null;

  const isSingle = photos.length === 1;

  return (
    <div
      role="region"
      aria-label="Photo gallery"
      className="h-full flex flex-col justify-center"
    >
      {isSingle ? (
        <div className="relative w-full aspect-[3/4] rounded-sm overflow-hidden shadow-lg">
          <Image
            src={photos[0].src}
            alt={photos[0].alt}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 grid-rows-3 gap-2">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.12, delay: i * 0.03, ease: "easeOut" }}
              className={`relative aspect-square overflow-hidden rounded-sm ${photo.className ?? ""}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 50vw, 150px"
                className="object-cover"
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
