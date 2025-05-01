// components/mdx-content.tsx
"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { ComponentProps } from "react";

interface MDXContentProps {
  content: MDXRemoteSerializeResult;
}

export function MDXContent({ content }: MDXContentProps) {
  return <MDXRemote {...content} />;
}
