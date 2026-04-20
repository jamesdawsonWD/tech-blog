// Long Tasks Tracking — tasks blocking main thread >50ms
// Source: https://webperf-snippets.nucliweb.net/Interaction/LongTask

(() => {
  const formatMs = (ms) => `${Math.round(ms)}ms`;
  const getSeverity = (duration) => {
    if (duration > 250) return "critical";
    if (duration > 150) return "high";
    if (duration > 100) return "medium";
    return "low";
  };
  const allTasks = [];
  let totalBlockingTime = 0;
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const duration = entry.duration;
        const blockingTime = Math.max(0, duration - 50);
        totalBlockingTime += blockingTime;
        allTasks.push({
          startTime: entry.startTime, duration, blockingTime,
          severity: getSeverity(duration),
          attribution: entry.attribution?.[0]?.containerType || "unknown",
        });
        console.log(`⏱️ Long Task: ${formatMs(duration)} (blocking: ${formatMs(blockingTime)})`);
      }
    });
    observer.observe({ type: "longtask", buffered: true });
    window.getLongTaskSummary = () => {
      if (allTasks.length === 0) { console.log("No long tasks."); return { script: "LongTask", status: "ok", count: 0 }; }
      const durations = allTasks.map((t) => t.duration);
      const worst = Math.max(...durations);
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      console.table(allTasks.sort((a, b) => b.duration - a.duration).slice(0, 10).map((t) => ({ Start: formatMs(t.startTime), Duration: formatMs(t.duration), Blocking: formatMs(t.blockingTime), Container: t.attribution })));
      return {
        script: "LongTask", status: "ok", count: allTasks.length,
        details: {
          totalBlockingTimeMs: Math.round(totalBlockingTime),
          worstTaskMs: Math.round(worst),
          avgDurationMs: Math.round(avg),
          bySeverity: {
            critical: allTasks.filter((t) => t.severity === "critical").length,
            high: allTasks.filter((t) => t.severity === "high").length,
            medium: allTasks.filter((t) => t.severity === "medium").length,
            low: allTasks.filter((t) => t.severity === "low").length,
          },
        },
      };
    };
    console.log("%c⏱️ Long Tasks Tracking Active — call getLongTaskSummary()", "font-weight: bold;");
    const longtaskBuffered = performance.getEntriesByType("longtask");
    return {
      script: "LongTask", status: "tracking", count: longtaskBuffered.length,
      details: { totalBlockingTimeMs: Math.round(longtaskBuffered.reduce((s, t) => s + Math.max(0, t.duration - 50), 0)) },
      getDataFn: "getLongTaskSummary",
    };
  } catch (e) {
    return { script: "LongTask", status: "unsupported", error: e.message };
  }
})();
