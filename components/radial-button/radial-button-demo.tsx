"use client";

import { useState } from "react";
import RadialButton, { type RadialSectionId } from "./radial-button";
import DeferredMount from "@/components/deferred-mount";

function RadialButtonDemoInner() {
  const [activeId, setActiveId] = useState<RadialSectionId>("profile");

  return (
    <div className="flex justify-center py-12">
      <RadialButton activeId={activeId} onSelect={setActiveId} />
    </div>
  );
}

export default function RadialButtonDemo() {
  return (
    <DeferredMount minHeight={420}>
      <RadialButtonDemoInner />
    </DeferredMount>
  );
}
