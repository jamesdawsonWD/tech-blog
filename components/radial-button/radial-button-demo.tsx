"use client";

import { useState } from "react";
import RadialButton, { type RadialSectionId } from "./radial-button";

export default function RadialButtonDemo() {
  const [activeId, setActiveId] = useState<RadialSectionId>("profile");

  return (
    <div className="flex justify-center py-12">
      <RadialButton activeId={activeId} onSelect={setActiveId} />
    </div>
  );
}
