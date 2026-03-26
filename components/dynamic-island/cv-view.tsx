"use client";

import { motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { EXPERIENCE, SKILL_CATEGORIES } from "@/lib/cv-data";

export function CVView({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex w-full max-w-sm flex-col">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span className="text-sm font-semibold text-white">CV</span>
        <div className="flex items-center gap-2">
          <motion.a
            whileTap={{ scale: 0.9 }}
            href="/cv.pdf"
            download="james-dawson-cv.pdf"
            onClick={(e) => e.stopPropagation()}
            className="flex h-7 items-center gap-1.5 rounded-full bg-white/15 px-3 text-xs font-medium text-white transition-colors hover:bg-white/25"
          >
            <Download size={12} />
            Download
          </motion.a>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            <X size={14} />
          </motion.button>
        </div>
      </div>

      <div
        className="prose prose-invert prose-sm island-scrollbar max-h-[60vh] overflow-y-auto px-5 py-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base leading-relaxed text-white/70">
          <strong className="text-white">Senior Design Engineer</strong>{" "}
          building beautiful experiences and modern web products.
        </p>

        <div className="mt-6 border-t border-white/10 pt-6">
          <span className="mb-4 block text-xs font-semibold uppercase tracking-wider text-white/40">
            Experience
          </span>
          <div className="space-y-5">
            {EXPERIENCE.map((job) => (
              <div key={job.company} className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  {job.role}
                </span>
                <span className="text-sm text-white/40">
                  {job.company} &middot; {job.period}
                </span>
                <p className="mt-1 text-sm leading-relaxed text-white/70">
                  {job.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-6">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-white/40">
            Skills
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SKILL_CATEGORIES.flatMap((cat) =>
              cat.items.map((skill) => (
                <span
                  key={`${cat.label}-${skill}`}
                  className="rounded-md bg-white/10 px-2 py-0.5 text-sm text-white/70"
                >
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-6">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-white/40">
            Education
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              University of Stirling
            </span>
            <span className="text-sm text-white/40">
              Software Engineering BEng &middot; 2012&ndash;2017
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
