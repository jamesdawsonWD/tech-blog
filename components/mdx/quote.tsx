import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Shared shell behind <Quote> and <Definition>. A borderless "pull" block
 * (no card chrome) with an optional header slot, an optional footer slot, and
 * paragraph-aware body. `not-prose` so the article's prose typography never
 * flattens it. <Quote> is the display variant; <Definition> is a quieter
 * variant of the same shell. Both carry the curly quote marks.
 */
function PullBlock({
  children,
  header,
  footer,
  bodyClassName,
  className,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  bodyClassName?: string;
  className?: string;
}) {
  return (
    <figure className={cn("not-prose my-[var(--article-rhythm-lg)]", className)}>
      {header && <figcaption className="mb-4">{header}</figcaption>}

      <blockquote
        className={cn(
          "pull-quote text-pretty text-foreground [&_p]:m-0 [&_p+p]:mt-4",
          bodyClassName
        )}
      >
        {children}
      </blockquote>

      {footer && (
        <figcaption className="mt-7 flex items-center justify-end gap-3 text-sm">
          {footer}
        </figcaption>
      )}
    </figure>
  );
}

export function Quote({
  children,
  author,
  role,
  avatar,
}: {
  children: ReactNode;
  author?: string;
  role?: string;
  avatar?: string;
}) {
  return (
    <PullBlock
      bodyClassName="text-[1.6rem] font-medium leading-[1.35] tracking-[-0.01em] sm:text-[2rem]"
      footer={
        author ? (
          <>
            {avatar && (
              <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border">
                <Image
                  src={avatar}
                  alt={author}
                  fill
                  sizes="32px"
                  unoptimized
                  className="object-cover"
                />
              </span>
            )}
            <span className="text-foreground">
              <span className="font-semibold">{author}</span>
              {role && (
                <span className="font-normal text-muted-foreground">
                  , {role}
                </span>
              )}
            </span>
          </>
        ) : undefined
      }
    >
      {children}
    </PullBlock>
  );
}

/**
 * Definition variant: same borderless pull shell and quote marks as <Quote>,
 * but with a dictionary-style header (word · part of speech · phonetic) and
 * quieter, readable body text instead of a display pull-quote.
 */
export function Definition({
  children,
  word,
  partOfSpeech,
  phonetic,
}: {
  children: ReactNode;
  word: string;
  partOfSpeech?: string;
  phonetic?: string;
}) {
  return (
    <PullBlock
      bodyClassName="text-lg leading-relaxed text-foreground/90 [&_a]:text-lime-600 [&_a]:underline [&_a]:underline-offset-2"
      header={
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-serif text-2xl font-semibold text-foreground">
            {word}
          </span>
          {partOfSpeech && (
            <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {partOfSpeech}
            </span>
          )}
          {phonetic && (
            <span className="font-mono text-sm text-muted-foreground">
              {phonetic}
            </span>
          )}
        </span>
      }
    >
      {children}
    </PullBlock>
  );
}
