"use client";
import { CldImage, type CldImageProps } from "next-cloudinary";

type ExtendedCldImageProps = CldImageProps & {
  className?: string;
};

export default function CdnImage({
  src,
  width,
  height,
  crop,
  alt,
  className,
}: ExtendedCldImageProps) {
  return (
    <CldImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      crop={crop}
      className={className}
    />
  );
}
