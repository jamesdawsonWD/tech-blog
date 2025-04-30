"use client"

import React from "react"
import { useTheme } from "next-themes"

interface MDXContentProps {
  content: string
}

export function MDXContent({ content }: MDXContentProps) {
  const { theme } = useTheme()

  // Process the markdown content
  const processedContent = React.useMemo(() => {
    return processMarkdown(content)
  }, [content])

  return <div className="mdx-content" dangerouslySetInnerHTML={{ __html: processedContent }} />
}

function processMarkdown(markdown: string): string {
  // Simple markdown processing
  const html = markdown
    // Process headers
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^#### (.*$)/gm, "<h4>$1</h4>")
    .replace(/^##### (.*$)/gm, "<h5>$1</h5>")
    .replace(/^###### (.*$)/gm, "<h6>$1</h6>")

    // Process paragraphs
    .replace(/^\s*(\n)?(.+)/gm, (m) =>
      /^<(\/)?(h\d|ul|ol|li|blockquote|pre|img|code)/.test(m) ? m : "<p>" + m + "</p>",
    )

    // Process bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // Process italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")

    // Process code blocks
    .replace(
      /```(.*?)\n([\s\S]*?)```/g,
      (match, language, code) =>
        `<div class="code-block"><div class="code-header">${language}</div><pre><code class="language-${language}">${escapeHtml(code.trim())}</code></pre></div>`,
    )

    // Process inline code
    .replace(/`(.*?)`/g, "<code>$1</code>")

    // Process links
    .replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2">$1</a>')

    // Process lists
    .replace(/^\s*\*\s(.*)/gm, "<ul><li>$1</li></ul>")
    .replace(/^\s*\d\.\s(.*)/gm, "<ol><li>$1</li></ol>")

    // Fix lists (combine consecutive list items)
    .replace(/<\/ul>\s*<ul>/g, "")
    .replace(/<\/ol>\s*<ol>/g, "")

    // Process blockquotes
    .replace(/^>\s(.*)/gm, "<blockquote>$1</blockquote>")
    .replace(/<\/blockquote>\s*<blockquote>/g, "<br>")

    // Process horizontal rules
    .replace(/^---$/gm, "<hr>")

    // Process line breaks
    .replace(/\n/g, "<br>")

  return html
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
