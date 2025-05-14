"use client";

import React from "react";
import ConsoleWrapper from "../console-wrapper";

type Props = {
  url: string;
};

export default function UrlVisualizer({ url }: Props) {
  let parsed: URL | null = null;
  try {
    parsed = new URL(url);
  } catch (e) {
    return <p className="text-red-500 font-mono text-sm">❌ Invalid URL</p>;
  }

  const searchParams = Array.from(parsed.searchParams.entries());

  return (
    <ConsoleWrapper className="p-4">
      <div className="font-mono flex flex-wrap gap-1">
        {/* Protocol */}
        <span className="text-blue-400">{parsed.protocol}//</span>

        {/* Host */}
        <span className="text-green-400">{parsed.host}</span>

        {/* Path */}
        {parsed.pathname !== "/" && (
          <span className="text-yellow-400">{parsed.pathname}</span>
        )}

        {/* Search Params */}
        {searchParams.length > 0 && (
          <>
            <span className="text-pink-400">?</span>
            {searchParams.map(([key, value], index) => (
              <span key={key} className="text-pink-400">
                {key}
                <span>=</span>
                {value}
                {index < searchParams.length - 1 && <span>&</span>}
              </span>
            ))}
          </>
        )}
      </div>
    </ConsoleWrapper>
  );
}
