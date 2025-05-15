import type React from "react";
import type { Metadata } from "next/types";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/components/PostHogProvider";
import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";
import { ArrowRightIcon, MailIcon } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <PostHogProvider>
          <header
            className="sticky top-0 z-40 w-full bg-background/70   backdrop-blur-lg"
          >
            <div className="container flex  items-center justify-between py-4">
              <Link
                href="/"
                className="text-xl font-extrabold tracking-[-0.072em]"
              >
                mwd.
              </Link>
              <LinkButton href="/signup">
                <div className="ease absolute left-5 translate-x-0 opacity-100 transition duration-300 group-hover:-translate-x-full group-hover:scale-x-50 group-hover:opacity-0 group-hover:blur-sm">
                  <MailIcon className="h-6 w-6 stroke-current text-background" />
                </div>
                <div className="ease translate-x-0  transition duration-300 group-hover:-translate-x-8">
                  Get Newsletter
                </div>
                <div className="ease absolute right-5 translate-x-full scale-x-50 opacity-0 blur-sm transition duration-300 group-hover:translate-x-0 group-hover:scale-x-100 group-hover:opacity-100 group-hover:blur-none">
                  <ArrowRightIcon className="h-6 w-6 stroke-current text-background" />
                </div>
              </LinkButton>
            </div>
          </header>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <div className="mt-12">{children}</div>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
