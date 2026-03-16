"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { EXPERIENCE, SKILL_CATEGORIES } from "@/lib/cv-data";

export default function CVSection() {
  return (
    <motion.div
      role="region"
      aria-label="Curriculum vitae"

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
        
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 text-sm text-foreground"
              >
              
                {skill}
              </motion.span>
            ))
          )}
        </div>

        <motion.div
       
        >
          <p className="font-semibold text-[#141414]">University of Stirling</p>
          <p className="text-muted-foreground text-sm">Software Engineering BEng</p>
          <p className="text-muted-foreground text-sm">2012–2017</p>
        </motion.div>
      </div>

    </motion.div>
  );
}
