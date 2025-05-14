"use client";

import { FaXTwitter, FaGithub, FaDiscord } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="relative  text-center pt-20 pb-48 overflow-hidden">
      {/* Icons */}
      <div className="flex justify-center gap-4 relative z-10 mb-6">
        <a
          href="https://x.com/jamesdawson_x"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-[#eff2e8] p-2 hover:opacity-80 transition"
        >
          <FaXTwitter size={20} />
        </a>
      </div>

      {/* Large faded background text */}
      <div className="absolute inset-0  justify-center items-end z-0 pointer-events-none">
        <h1 className="text-[30vw] font-extrabold text-[#dfe2d9] leading-none opacity-20 select-none">
          mwd
        </h1>
      </div>
    </footer>
  );
}
