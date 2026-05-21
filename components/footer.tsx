export default function Footer() {
  return (
    <footer className="relative  text-center pt-20 pb-48 overflow-hidden">
      {/* Icons */}
      <div className="flex justify-center gap-4 relative z-10 mb-6">
        <a
          href="https://x.com/_on0x"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-[#eff2e8] p-2 hover:opacity-80 transition"
          aria-label="Follow James on X (formerly Twitter)"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
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
