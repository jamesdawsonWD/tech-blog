// Long Animation Frames (LoAF) — modern main-thread blocking attribution
// Source: https://webperf-snippets.nucliweb.net/Interaction/Long-Animation-Frames

(() => {
  const formatMs = (ms) => `${Math.round(ms)}ms`;
  const allLoAFs = [];
  const allEvents = [];
  const getScriptSummary = (script) => ({
    invoker: script.invoker || script.name || "(anonymous)",
    source: script.sourceURL ? script.sourceURL.split("/").pop()?.split("?")[0] || script.sourceURL : "",
    type: script.invokerType || "unknown",
  });
  const processLoAF = (entry) => {
    const endTime = entry.startTime + entry.duration;
    const workDuration = entry.renderStart ? entry.renderStart - entry.startTime : entry.duration;
    const renderDuration = entry.renderStart ? endTime - entry.renderStart : 0;
    const styleAndLayoutDuration = entry.styleAndLayoutStart ? endTime - entry.styleAndLayoutStart : 0;
    const totalForcedStyleAndLayout = entry.scripts.reduce((sum, s) => sum + (s.forcedStyleAndLayoutDuration || 0), 0);
    const scripts = entry.scripts.map((s) => ({
      ...getScriptSummary(s),
      duration: Math.round(s.duration),
      execDuration: Math.round(s.executionStart ? s.startTime + s.duration - s.executionStart : s.duration),
      forcedStyleAndLayout: Math.round(s.forcedStyleAndLayoutDuration || 0),
      startTime: Math.round(s.startTime),
    }));
    return {
      startTime: Math.round(entry.startTime), duration: Math.round(entry.duration),
      blockingDuration: Math.round(entry.blockingDuration),
      workDuration: Math.round(workDuration), renderDuration: Math.round(renderDuration),
      styleAndLayoutDuration: Math.round(styleAndLayoutDuration),
      totalForcedStyleAndLayout: Math.round(totalForcedStyleAndLayout),
      scripts, entry,
    };
  };
  try {
    const loafObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const processed = processLoAF(entry);
        allLoAFs.push(processed);
        if (entry.blockingDuration > 0) {
          console.log(`⏱️ LoAF: ${formatMs(entry.duration)} (blocking ${formatMs(entry.blockingDuration)})`);
        }
      }
    });
    const eventObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.interactionId) allEvents.push(entry);
      }
    });
    loafObserver.observe({ type: "long-animation-frame", buffered: true });
    eventObserver.observe({ type: "event", buffered: true });
    window.getLoAFSummary = () => {
      if (allLoAFs.length === 0) return { script: "Long-Animation-Frames", status: "ok", count: 0 };
      const blocking = allLoAFs.filter((l) => l.blockingDuration > 0);
      const totalBlocking = blocking.reduce((sum, l) => sum + l.blockingDuration, 0);
      const worstBlocking = Math.max(...allLoAFs.map((l) => l.blockingDuration));
      const scriptStats = new Map();
      allLoAFs.forEach((loaf) => {
        loaf.scripts.forEach((script) => {
          const key = `${script.invoker}|${script.source}`;
          if (!scriptStats.has(key)) scriptStats.set(key, { invoker: script.invoker, source: script.source, count: 0, totalDuration: 0, totalForcedSL: 0 });
          const stats = scriptStats.get(key);
          stats.count++; stats.totalDuration += script.duration; stats.totalForcedSL += script.forcedStyleAndLayout;
        });
      });
      const topScripts = Array.from(scriptStats.values()).sort((a, b) => b.totalDuration - a.totalDuration).slice(0, 10);
      console.table(topScripts.map((s) => ({ Invoker: s.invoker, Count: s.count, "Total": formatMs(s.totalDuration), "Forced S&L": formatMs(s.totalForcedSL), Source: s.source })));
      return {
        script: "Long-Animation-Frames", status: "ok", count: allLoAFs.length,
        details: {
          totalLoAFs: allLoAFs.length, withBlockingTime: blocking.length,
          totalBlockingTimeMs: Math.round(totalBlocking), worstBlockingMs: Math.round(worstBlocking),
          topScripts: topScripts.slice(0, 5).map((s) => ({ invoker: s.invoker, source: s.source, totalDurationMs: Math.round(s.totalDuration), count: s.count })),
        },
      };
    };
    console.log("%c🎬 LoAF tracking active — call getLoAFSummary()", "font-weight: bold;");
    const loafBuffered = performance.getEntriesByType("long-animation-frame");
    const blockingLoafs = loafBuffered.filter((e) => e.blockingDuration > 0);
    return {
      script: "Long-Animation-Frames", status: "tracking", count: loafBuffered.length,
      details: {
        totalLoAFs: loafBuffered.length, withBlockingTime: blockingLoafs.length,
        totalBlockingTimeMs: Math.round(blockingLoafs.reduce((s, e) => s + e.blockingDuration, 0)),
        worstBlockingMs: loafBuffered.length > 0 ? Math.round(Math.max(...loafBuffered.map((e) => e.blockingDuration))) : 0,
      },
      getDataFn: "getLoAFSummary",
    };
  } catch (e) {
    return { script: "Long-Animation-Frames", status: "unsupported", error: e.message };
  }
})();
