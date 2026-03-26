"use client";

import dynamic from "next/dynamic";

const DynamicIsland = dynamic(
  () => import("./dynamic-island"),
  { ssr: false }
);

export default function DynamicIslandLoader() {
  return <DynamicIsland />;
}
