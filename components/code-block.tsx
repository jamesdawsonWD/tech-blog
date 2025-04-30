"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

interface CodeBlockProps {
  className?: string
  children: React.ReactNode
}

export function CodeBlock({ className, children }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const code = typeof children === "string" ? children : String(children)
  const language = className?.replace(/language-/, "") || ""

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative my-6 overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between bg-muted px-4 py-2">
        <span className="text-sm text-muted-foreground">{language}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm">
        <code>{code}</code>
      </pre>
    </div>
  )
}
