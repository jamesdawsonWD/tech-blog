"use client";

import { useTheme } from "next-themes";
import { Sandpack } from "@codesandbox/sandpack-react";
import { gruvboxDark, githubLight } from "@codesandbox/sandpack-themes";

interface CodeSandpackProps {
  files: Record<string, string>;
  template?:
    | "react"
    | "react-ts"
    | "vanilla"
    | "vanilla-ts"
    | "nextjs"
    | "node";
  options?: {
    showNavigator?: boolean;
    showTabs?: boolean;
    showLineNumbers?: boolean;
    showInlineErrors?: boolean;
    wrapContent?: boolean;
    editorHeight?: number | string;
    previewHeight?: number | string;
  };
}

export function CodeSandpack({
  files,
  template = "react",
  options = {
    showNavigator: true,
    showTabs: true,
    showLineNumbers: true,
    showInlineErrors: true,
    wrapContent: true,
    editorHeight: 400,
    previewHeight: 400,
  },
}: CodeSandpackProps) {
  const { theme } = useTheme();
  const sandpackTheme = gruvboxDark;

  // Convert files from Record<string, string> to the format Sandpack expects
  const sandpackFiles: Record<string, { code: string }> = {};
  Object.keys(files).forEach((key) => {
    sandpackFiles[key] = { code: files[key] };
  });

  return (
    <div className="my-8 border rounded-2xl overflow-hidden border-stone-700 bg-stone-800 shadow-xl shadow-slate-950/20 ">
      <Sandpack
        theme={sandpackTheme}
        template={template}
        files={sandpackFiles}
        options={{
          showNavigator: options.showNavigator,
          showLineNumbers: options.showLineNumbers,
          showInlineErrors: options.showInlineErrors,
          wrapContent: options.wrapContent,
          editorHeight: options.editorHeight,
        }}
      />
    </div>
  );
}
