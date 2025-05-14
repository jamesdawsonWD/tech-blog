// components/mdx-content.tsx
"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { CodeGroup } from "./mdx/code-group"; // adjust path as needed
import { CodeBlock } from "./mdx/code-block"; // adjust path as needed
import { CodeSandpack } from "./mdx/code-sandpack"; // adjust path as needed

interface MDXContentProps {
  content: MDXRemoteSerializeResult;
}

export function MDXContent({ content }: MDXContentProps) {
  return (
    <MDXRemote
      {...content}
      components={{
        CodeGroup,
        CodeSandpack,
        CodeBlock,
      }}
    />
  );
}
