import type React from "react";
import type { Metadata } from "next/types";

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
    <>
      <div className="mt-12">{children}</div>
    </>
  );
}
