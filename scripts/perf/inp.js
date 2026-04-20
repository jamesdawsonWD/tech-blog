// INP (Interaction to Next Paint) Tracking
// Source: https://webperf-snippets.nucliweb.net/CoreWebVitals/INP

(() => {
  const interactions = [];
  let inpValue = 0;
  let inpEntry = null;
  const valueToRating = (ms) => ms <= 200 ? "good" : ms <= 500 ? "needs-improvement" : "poor";
  const formatMs = (ms) => `${Math.round(ms)}ms`;
  const calculateINP = () => {
    if (interactions.length === 0) return { value: 0, entry: null };
    const sorted = [...interactions].sort((a, b) => b.duration - a.duration);
    const index = interactions.length < 50 ? 0 : Math.floor(interactions.length * 0.02);
    return { value: sorted[index].duration, entry: sorted[index] };
  };
  const getPhaseBreakdown = (entry) => {
    const phases = { inputDelay: 0, processingTime: 0, presentationDelay: 0 };
    if (entry.processingStart && entry.processingEnd) {
      phases.inputDelay = entry.processingStart - entry.startTime;
      phases.processingTime = entry.processingEnd - entry.processingStart;
      phases.presentationDelay = entry.duration - phases.inputDelay - phases.processingTime;
    }
    return phases;
  };
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.interactionId) continue;
      const existing = interactions.find((i) => i.interactionId === entry.interactionId);
      if (!existing || entry.duration > existing.duration) {
        if (existing) interactions.splice(interactions.indexOf(existing), 1);
        interactions.push({
          name: entry.name, duration: entry.duration, startTime: entry.startTime,
          interactionId: entry.interactionId, target: entry.target,
          processingStart: entry.processingStart, processingEnd: entry.processingEnd,
          phases: getPhaseBreakdown(entry), entry,
        });
      }
      const result = calculateINP();
      inpValue = result.value;
      inpEntry = result.entry;
    }
  });
  observer.observe({ type: "event", buffered: true, durationThreshold: 16 });
  window.getINP = () => {
    const result = calculateINP();
    inpValue = result.value;
    inpEntry = result.entry;
    const rating = valueToRating(inpValue);
    console.log(`%cINP: ${formatMs(inpValue)} (${rating})`, "font-weight: bold;");
    if (inpEntry) {
      console.log(`Worst: ${inpEntry.name}`, inpEntry.target);
      console.log(`Phases: input=${formatMs(inpEntry.phases.inputDelay)} processing=${formatMs(inpEntry.phases.processingTime)} presentation=${formatMs(inpEntry.phases.presentationDelay)}`);
    }
    if (interactions.length === 0) return { script: "INP", status: "error", error: "No interactions recorded. Interact with the page and call getINP() again.", getDataFn: "getINP" };
    const details = { totalInteractions: interactions.length };
    if (inpEntry) {
      details.worstEvent = inpEntry.name;
      details.phases = {
        inputDelay: Math.round(inpEntry.phases.inputDelay),
        processingTime: Math.round(inpEntry.phases.processingTime),
        presentationDelay: Math.round(inpEntry.phases.presentationDelay),
      };
    }
    return { script: "INP", status: "ok", metric: "INP", value: Math.round(inpValue), unit: "ms", rating, thresholds: { good: 200, needsImprovement: 500 }, details };
  };
  console.log("%c⚡ INP Tracking Active — interact then call getINP()", "font-weight: bold;");
  return { script: "INP", status: "tracking", message: "Interact with page then call getINP().", getDataFn: "getINP" };
})();
