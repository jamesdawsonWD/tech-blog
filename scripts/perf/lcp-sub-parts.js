// LCP Sub-Parts Analysis — TTFB, Resource Load Delay, Load Time, Render Delay
// Source: https://webperf-snippets.nucliweb.net/CoreWebVitals/LCP-Sub-Parts

(() => {
  const formatMs = (ms) => `${Math.round(ms)}ms`;
  const valueToRating = (ms) => ms <= 2500 ? "good" : ms <= 4000 ? "needs-improvement" : "poor";
  const SUB_PARTS = [
    { name: "Time to First Byte", key: "ttfb", target: 800 },
    { name: "Resource Load Delay", key: "resourceLoadDelay", targetPercent: 10 },
    { name: "Resource Load Time", key: "resourceLoadTime", targetPercent: 40 },
    { name: "Element Render Delay", key: "elementRenderDelay", targetPercent: 10 },
  ];
  const getNavigationEntry = () => {
    const navEntry = performance.getEntriesByType("navigation")[0];
    if (navEntry?.responseStart > 0 && navEntry.responseStart < performance.now()) return navEntry;
    return null;
  };
  const observer = new PerformanceObserver((list) => {
    const lcpEntry = list.getEntries().at(-1);
    if (!lcpEntry) return;
    const navEntry = getNavigationEntry();
    if (!navEntry) return;
    const lcpResEntry = performance.getEntriesByType("resource").find((e) => e.name === lcpEntry.url);
    const activationStart = navEntry.activationStart || 0;
    const ttfb = Math.max(0, navEntry.responseStart - activationStart);
    const lcpRequestStart = Math.max(ttfb, lcpResEntry ? (lcpResEntry.requestStart || lcpResEntry.startTime) - activationStart : 0);
    const lcpResponseEnd = Math.max(lcpRequestStart, lcpResEntry ? lcpResEntry.responseEnd - activationStart : 0);
    const lcpRenderTime = Math.max(lcpResponseEnd, lcpEntry.startTime - activationStart);
    const subPartValues = {
      ttfb, resourceLoadDelay: lcpRequestStart - ttfb,
      resourceLoadTime: lcpResponseEnd - lcpRequestStart,
      elementRenderDelay: lcpRenderTime - lcpResponseEnd,
    };
    const rating = valueToRating(lcpRenderTime);
    console.group(`%cLCP: ${formatMs(lcpRenderTime)} (${rating})`, "font-weight: bold;");
    const phases = SUB_PARTS.map((part) => ({ ...part, value: subPartValues[part.key], percent: (subPartValues[part.key] / lcpRenderTime) * 100 }));
    const slowest = phases.reduce((a, b) => (a.value > b.value ? a : b));
    console.table(phases.map((p) => ({ "Sub-part": p.key === slowest.key ? `⚠️ ${p.name}` : p.name, Time: formatMs(p.value), "%": `${Math.round(p.percent)}%` })));
    console.log(`💡 Slowest: ${slowest.name}`);
    console.groupEnd();
  });
  observer.observe({ type: "largest-contentful-paint", buffered: true });
  console.log("%c📊 LCP Sub-Parts Analysis Active", "font-weight: bold;");

  const lcpBuffered = performance.getEntriesByType("largest-contentful-paint");
  const lcpEntry = lcpBuffered.at(-1);
  if (!lcpEntry) return { script: "LCP-Sub-Parts", status: "error", error: "No LCP entries yet" };
  const navEntrySync = getNavigationEntry();
  if (!navEntrySync) return { script: "LCP-Sub-Parts", status: "error", error: "No navigation entry" };
  const lcpResEntrySync = performance.getEntriesByType("resource").find((e) => e.name === lcpEntry.url);
  const activationStartSync = navEntrySync.activationStart || 0;
  const ttfbSync = Math.max(0, navEntrySync.responseStart - activationStartSync);
  const lcpRequestStartSync = Math.max(ttfbSync, lcpResEntrySync ? (lcpResEntrySync.requestStart || lcpResEntrySync.startTime) - activationStartSync : 0);
  const lcpResponseEndSync = Math.max(lcpRequestStartSync, lcpResEntrySync ? lcpResEntrySync.responseEnd - activationStartSync : 0);
  const lcpRenderTimeSync = Math.max(lcpResponseEndSync, lcpEntry.startTime - activationStartSync);
  const totalSync = Math.round(lcpRenderTimeSync);
  const ttfbVal = Math.round(ttfbSync);
  const loadDelayVal = Math.round(lcpRequestStartSync - ttfbSync);
  const loadTimeVal = Math.round(lcpResponseEndSync - lcpRequestStartSync);
  const renderDelayVal = Math.round(lcpRenderTimeSync - lcpResponseEndSync);
  const subPartsForRank = [
    { key: "ttfb", value: ttfbVal }, { key: "resourceLoadDelay", value: loadDelayVal },
    { key: "resourceLoadTime", value: loadTimeVal }, { key: "elementRenderDelay", value: renderDelayVal },
  ];
  const slowestPhaseSync = subPartsForRank.reduce((a, b) => a.value > b.value ? a : b).key;
  return {
    script: "LCP-Sub-Parts", status: "ok", metric: "LCP", value: totalSync, unit: "ms",
    rating: valueToRating(totalSync), thresholds: { good: 2500, needsImprovement: 4000 },
    details: {
      subParts: {
        ttfb: { value: ttfbVal, percent: Math.round((ttfbVal / totalSync) * 100) },
        resourceLoadDelay: { value: loadDelayVal, percent: Math.round((loadDelayVal / totalSync) * 100) },
        resourceLoadTime: { value: loadTimeVal, percent: Math.round((loadTimeVal / totalSync) * 100) },
        elementRenderDelay: { value: renderDelayVal, percent: Math.round((renderDelayVal / totalSync) * 100) },
      },
      slowestPhase: slowestPhaseSync,
    },
  };
})();
