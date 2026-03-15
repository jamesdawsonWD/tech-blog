import type React from "react";
import type { Metadata } from "next/types";
import { Inter, Inria_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/components/PostHogProvider";

const inter = Inter({ subsets: ["latin"] });
const inriaSerif = Inria_Serif({ subsets: ["latin"], weight: ["300", "400", "700"], style: ["normal", "italic"], variable: "--font-inria-serif" });

export const metadata: Metadata = {
  title: "DevBlog - Programming Insights",
  description:
    "A responsive blog with syntax highlighting and engagement features",
  generator: "v0.dev",
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
      </body>
    </html>
  );
}
