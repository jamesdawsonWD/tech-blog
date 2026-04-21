import { cn } from "@/lib/utils";

export function DictionaryCard({
  word,
  phonetic,
  partOfSpeech,
  className,
  children,
}: {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <aside
      className={cn(
        "not-prose my-8 rounded-xl border bg-card px-5 py-4 shadow-sm",
        className
      )}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-serif text-2xl font-semibold text-foreground">
          {word}
        </span>
        {partOfSpeech && (
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {partOfSpeech}
          </span>
        )}
        {phonetic && (
          <span className="font-mono text-sm text-muted-foreground">
            {phonetic}
          </span>
        )}
      </div>
      <div className="mt-3 text-[15px] leading-relaxed text-foreground/90 space-y-2 [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </aside>
  );
}
