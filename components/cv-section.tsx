"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { EXPERIENCE, SKILL_CATEGORIES } from "@/lib/cv-data";

export default function CVSection() {
  return (
    <motion.div
      role="region"
      aria-label="Curriculum vitae"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="relative xl:absolute inset-0 z-10 bg-background xl:overflow-y-auto"
    >
      <div className="p-0 xl:p-24 max-w-2xl space-y-16">
        <p className="text-[#141414] text-base font-normal tracking-[-0.0125em] leading-relaxed">
          <strong>Senior Design Engineer</strong> building beauitful experiences and
          modern web products primarily in the Web3.
        </p>

 
        <div className="space-y-8">
          {EXPERIENCE.map((job, i) => (
            <motion.div
              key={job.company}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: i * 0.03, ease: "easeOut" }}
            >
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                <span className="font-semibold text-[#141414]">{job.role}</span>
                <span className="text-muted-foreground">{job.company}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{job.period}</p>
              <p className="text-[#141414] text-base font-normal tracking-[-0.0125em] leading-relaxed mt-2">
                {job.description}
              </p>
            </motion.div>
          ))}
        </div>

    
        <div className="flex flex-wrap gap-2">
          {SKILL_CATEGORIES.flatMap((cat, catIndex) =>
            cat.items.map((skill, skillIndex) => (
              <motion.span
                key={`${cat.label}-${skill}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.15,
                  delay: 0.2 + catIndex * 0.02 + skillIndex * 0.01,
                  ease: "easeOut",
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 text-sm text-foreground"
              >
              
                {skill}
              </motion.span>
            ))
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: 0.35, ease: "easeOut" }}
        >
          <p className="font-semibold text-[#141414]">University of Stirling</p>
          <p className="text-muted-foreground text-sm">Software Engineering BEng</p>
          <p className="text-muted-foreground text-sm">2012–2017</p>
        </motion.div>
      </div>
      <div className="sticky bottom-6 flex justify-center pt-6 pb-6">
        <a
          href="/cv.pdf"
          download="james-dawson-cv.pdf"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Download size={16} />
          Download CV
        </a>
      </div>
    </motion.div>
  );
}
