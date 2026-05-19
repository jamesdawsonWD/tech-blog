"use client";

import { Combobox } from "@base-ui/react/combobox";
import { SearchIcon } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { mockSearch, type SearchResult } from "./mock-search";

type SearchItem = SearchResult & { value: string };
type Status = "idle" | "loading" | "success" | "error";

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 64;

/**
 * 250ms sits inside the 200–300ms window typeahead research lands on.
 * Long enough to coalesce a burst of keystrokes into one request, short
 * enough that the user perceives results as "while I'm still typing."
 */
const DEBOUNCE_MS = 250;

/**
 * Defer loading affordances until we've actually been searching for a while.
 * Fast (<150ms) responses don't deserve a skeleton flash.
 */
const LOADING_UI_DELAY_MS = 150;

const SEARCH_CACHE_MAX = 100;
const SEARCH_CACHE_TTL_MS = 60_000;

type CacheEntry = { results: SearchResult[]; expiresAt: number };
const searchCache = new Map<string, CacheEntry>();

function cacheKey(q: string) {
  return q.trim().toLowerCase();
}

function readCache(q: string) {
  const k = cacheKey(q);
  const entry = searchCache.get(k);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    searchCache.delete(k);
    return undefined;
  }
  // Touch — LRU bump.
  searchCache.delete(k);
  searchCache.set(k, entry);
  return entry.results;
}

function writeCache(q: string, results: SearchResult[]) {
  const k = cacheKey(q);
  searchCache.delete(k);
  searchCache.set(k, { results, expiresAt: Date.now() + SEARCH_CACHE_TTL_MS });
  if (searchCache.size > SEARCH_CACHE_MAX) {
    const oldest = searchCache.keys().next().value;
    if (oldest !== undefined) searchCache.delete(oldest);
  }
}

export default function TypeaheadDemo() {
  const id = useId();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS);

  const { results, status, error } = useProductSearch(debouncedQuery);

  const trimmed = query.trim();

  // Synchronously check the cache against the live query — previously seen
  // searches feel instant without waiting out the debounce.
  const cached = useMemo(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) return undefined;
    return readCache(trimmed);
  }, [trimmed]);

  const effective = cached ?? results;
  const { items, selectedItem, setSelectedItem } = useTypeaheadItems(effective);

  const pendingDebounce = trimmed.length >= MIN_QUERY_LENGTH && trimmed !== debouncedQuery;
  const isSearching = !cached && (status === "loading" || pendingDebounce);
  const showLoadingUi = useDelayedFlag(isSearching, LOADING_UI_DELAY_MS);
  const showError = status === "error";
  const showPopup = trimmed.length >= MIN_QUERY_LENGTH;

  // Single string the screen reader announces once state settles. Empty during
  // typing/loading so we don't bombard with "loading…" on every keystroke.
  let liveAnnouncement = "";
  if (showPopup && !isSearching) {
    if (showError) liveAnnouncement = error ?? "Search failed.";
    else if (items.length === 0) liveAnnouncement = `No results for "${trimmed}".`;
    else liveAnnouncement = `${items.length} ${items.length === 1 ? "result" : "results"}.`;
  }

  function handleInputValueChange(next: string, details: { reason: string }) {
    if (details.reason === "input-clear") return;
    const safe = next.length > MAX_QUERY_LENGTH ? next.slice(0, MAX_QUERY_LENGTH) : next;
    setQuery(safe);
    if (selectedItem && safe !== selectedItem.label) setSelectedItem(null);
  }

  function handleValueChange(next: SearchItem | null) {
    setSelectedItem(next);
    if (next) setQuery(next.label);
  }

  return (
    <div className="not-prose my-8 rounded-xl border bg-muted/30 p-6">
      <p className="mb-4 text-sm text-muted-foreground">
        Type at least 2 characters. Try <code>iphone</code>, <code>laptop</code>,{" "}
        <code>gaming</code>. Watch the skeleton delay — short queries skip it.
      </p>
      <Combobox.Root<SearchItem>
        items={items}
        value={selectedItem}
        inputValue={query}
        onInputValueChange={handleInputValueChange}
        onValueChange={handleValueChange}
        itemToStringLabel={(item) => item.label}
        itemToStringValue={(item) => item.value}
        filter={null}
        // ComboboxRoot narrows autoHighlight to boolean, but AriaCombobox
        // (which Root passes through to) accepts 'always' at runtime.
        autoHighlight={"always" as unknown as boolean}
      >
        <div className="space-y-2">
          <Label htmlFor={id} className="sr-only">
            Search products
          </Label>
          <Combobox.InputGroup className="relative z-[60]">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <SearchIcon className="h-4 w-4" />
            </span>
            <Combobox.Input
              id={id}
              maxLength={MAX_QUERY_LENGTH}
              placeholder="Search products…"
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              render={<Input />}
              className="h-12 rounded-lg pl-11 pr-10 text-base"
            />
            <Combobox.Clear
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              ×
            </Combobox.Clear>
          </Combobox.InputGroup>

          <div aria-live="polite" className="min-h-5 px-1 text-sm text-destructive">
            {showError && error}
          </div>
          <div role="status" aria-live="polite" className="sr-only">
            {liveAnnouncement}
          </div>
        </div>

        {showPopup && (
          <Combobox.Portal>
            <Combobox.Positioner sideOffset={8} className="z-50 w-[var(--anchor-width)]">
              <Combobox.Popup className="rounded-xl border bg-popover p-2 text-popover-foreground shadow-xl outline-none">
                {showLoadingUi ? (
                  <SkeletonList />
                ) : isSearching ? null : (
                  <>
                    <Combobox.Empty>
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No results found.
                      </div>
                    </Combobox.Empty>
                    <VirtualisedResultList items={items} />
                  </>
                )}
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        )}
      </Combobox.Root>
    </div>
  );
}

function useProductSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setStatus("idle");
      setError(null);
      return;
    }

    const cached = readCache(query);
    if (cached) {
      setResults(cached);
      setStatus("success");
      setError(null);
      return;
    }

    const controller = new AbortController();
    setStatus("loading");
    setError(null);

    mockSearch(query, controller.signal)
      .then((data) => {
        // The fetch can resolve in the microtask queue after the effect has
        // already cleaned up. Without this guard we'd cache a result for a
        // query the user has moved on from.
        if (controller.signal.aborted) return;
        writeCache(query, data.results);
        setResults(data.results);
        setStatus("success");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof Error && err.name === "AbortError") return;
        setResults([]);
        setStatus("error");
        setError("Search is unavailable.");
      });

    return () => controller.abort();
  }, [query]);

  return { results, status, error };
}

function useTypeaheadItems(results: SearchResult[]) {
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null);

  const resultItems = useMemo<SearchItem[]>(
    () => results.map((item) => ({ ...item, value: item.id })),
    [results],
  );

  const items = useMemo(() => {
    if (!selectedItem) return resultItems;
    const inResults = resultItems.some((i) => i.id === selectedItem.id);
    return inResults ? resultItems : [selectedItem, ...resultItems];
  }, [resultItems, selectedItem]);

  return { items, selectedItem, setSelectedItem };
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

/**
 * Returns true only after `active` has been true for at least `delayMs`.
 * Suppresses a skeleton flash on fast (<150ms) responses.
 */
function useDelayedFlag(active: boolean, delayMs: number) {
  const [delayed, setDelayed] = useState(false);
  useEffect(() => {
    if (!active) {
      setDelayed(false);
      return;
    }
    const id = window.setTimeout(() => setDelayed(true), delayMs);
    return () => window.clearTimeout(id);
  }, [active, delayMs]);
  return delayed;
}

const VIRTUAL_ITEM_HEIGHT = 64;
const VIRTUAL_VIEWPORT_MAX = 320;

function useSimpleVirtualList(opts: {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const { itemCount, itemHeight, containerHeight, overscan = 5 } = opts;
  const [scrollTop, setScrollTop] = useState(0);
  const rafRef = useRef<number | null>(null);
  const pendingTopRef = useRef(0);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const totalHeight = itemCount * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(itemCount - 1, startIndex + visibleCount + overscan * 2);

  const virtualItems = useMemo(() => {
    const out: { index: number; top: number; height: number }[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      out.push({ index: i, top: i * itemHeight, height: itemHeight });
    }
    return out;
  }, [startIndex, endIndex, itemHeight]);

  // Coalesce scroll updates to one per frame. Scroll fires faster than React
  // can render in some browsers; without this the window lags the scrollbar.
  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    pendingTopRef.current = e.currentTarget.scrollTop;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setScrollTop(pendingTopRef.current);
    });
  }, []);

  return { totalHeight, virtualItems, onScroll };
}

function VirtualisedResultList({ items }: { items: SearchItem[] }) {
  const containerHeight = Math.min(
    Math.max(items.length, 1) * VIRTUAL_ITEM_HEIGHT,
    VIRTUAL_VIEWPORT_MAX,
  );
  const { totalHeight, virtualItems, onScroll } = useSimpleVirtualList({
    itemCount: items.length,
    itemHeight: VIRTUAL_ITEM_HEIGHT,
    containerHeight,
    overscan: 5,
  });

  return (
    <Combobox.List>
      <div
        onScroll={onScroll}
        style={{ height: containerHeight, overflowY: "auto", willChange: "transform" }}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {virtualItems.map((v) => {
            const item = items[v.index];
            return (
              <div
                key={item.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  transform: `translate3d(0, ${v.top}px, 0)`,
                  height: v.height,
                }}
              >
                <SearchResultItem item={item} />
              </div>
            );
          })}
        </div>
      </div>
    </Combobox.List>
  );
}

function SearchResultItem({ item }: { item: SearchItem }) {
  return (
    <Combobox.Item
      value={item}
      className="flex h-full cursor-default items-center justify-between gap-4 rounded-lg px-4 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[selected]:font-medium"
    >
      <div className="min-w-0">
        <div className="truncate font-medium">{item.label}</div>
        <div className="truncate text-xs text-muted-foreground">{item.subtitle}</div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-xs text-muted-foreground">£{item.price}</span>
        <Combobox.ItemIndicator className="text-muted-foreground">✓</Combobox.ItemIndicator>
      </div>
    </Combobox.Item>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-1 p-1" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 rounded-lg px-4 py-3"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-4 w-12 shrink-0" />
        </div>
      ))}
    </div>
  );
}
