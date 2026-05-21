import type React from "react";
import type { Metadata } from "next/types";
import { Inter, Inria_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/components/PostHogProvider";
import { Analytics } from "@vercel/analytics/next"

// Inter is the body font. We do NOT preload it because the LCP element on /
// is the h1 (Inria_Serif italic 700), and Inter would compete with it on the
// shared font-priority bucket. Body text swaps from fallback once CSS lands;
// `display: swap` keeps FCP unblocked.
const inter = Inter({ subsets: ["latin"], display: "swap", preload: false });

// Inria_Serif is only used by the homepage h1 (font-bold italic) — the LCP
// element. Loading all 6 weight×style combos preload-competes with the actual
// LCP font on cold loads and pushes the swap (and thus LCP) out by ~1s.
const inriaSerif = Inria_Serif({
  subsets: ["latin"],
  weight: "700",
  style: "italic",
  display: "swap",
  variable: "--font-inria-serif",
});

export const metadata: Metadata = {
  title: "Hi, I'm James",
  description:
    "A website with all of my bit and bobs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${inriaSerif.variable}`}>
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
