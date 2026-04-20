// Find render-blocking resources (Chrome 107+ only)
// Source: https://webperf-snippets.nucliweb.net/Loading/Find-render-blocking-resources

(() => {
  const testEntry = performance.getEntriesByType("resource")[0];
  if (testEntry && !("renderBlockingStatus" in testEntry)) {
    console.log("⚠️ renderBlockingStatus unsupported — use Chrome 107+");
    return { script: "Find-render-blocking-resources", status: "unsupported" };
  }
  const blockingResources = performance.getEntriesByType("resource")
    .filter((entry) => entry.renderBlockingStatus === "blocking")
    .map((entry) => {
      const url = new URL(entry.name);
      return {
        name: entry.name, shortName: url.pathname.split("/").pop() || url.pathname,
        type: entry.initiatorType, responseEnd: entry.responseEnd,
        duration: entry.duration, size: entry.transferSize || 0,
      };
    })
    .sort((a, b) => b.responseEnd - a.responseEnd);
  console.group("🚧 Render-Blocking Resources");
  if (blockingResources.length === 0) {
    console.log("✅ No render-blocking resources!");
  } else {
    const lastBlockingEnd = Math.max(...blockingResources.map((r) => r.responseEnd));
    const totalSize = blockingResources.reduce((sum, r) => sum + r.size, 0);
    console.log(`⚠️ ${blockingResources.length} blocking resource(s), blocked until ${lastBlockingEnd.toFixed(0)}ms, total ${(totalSize / 1024).toFixed(1)} KB`);
    console.table(blockingResources.map((r) => ({ Type: r.type, "Response End": `${r.responseEnd.toFixed(0)}ms`, Size: r.size > 0 ? `${(r.size / 1024).toFixed(1)} KB` : "N/A", Resource: r.shortName })));
  }
  console.groupEnd();
  const lastBlockingEnd = blockingResources.length ? Math.max(...blockingResources.map((r) => r.responseEnd)) : 0;
  const byType = blockingResources.reduce((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {});
  return {
    script: "Find-render-blocking-resources", status: "ok", count: blockingResources.length,
    details: {
      totalBlockingUntilMs: Math.round(lastBlockingEnd),
      totalSizeBytes: blockingResources.reduce((sum, r) => sum + r.size, 0),
      byType,
    },
    items: blockingResources.map((r) => ({ type: r.type, url: r.name, shortName: r.shortName, responseEndMs: Math.round(r.responseEnd), sizeBytes: r.size })),
  };
})();
