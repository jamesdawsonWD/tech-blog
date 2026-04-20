// Soft-Navigation LCP — click-to-largest-paint for SPA transitions
// Measures: time from soft-nav start (e.g., Link click) to when the largest
// element of the new view paints.
//
// Requires Chrome 123+ with Soft Navigation Heuristics enabled.
// Run chrome with: --enable-features=SoftNavigationHeuristics,SoftNavigationDetection
// If running in regular Chrome, this usually works out of the box since Chrome 127.
//
// Usage:
//   1. Load this snippet on the starting page (e.g. "/").
//   2. Trigger a soft navigation (click a <Link>).
//   3. Call window.getSoftNavLCP() to get the results per soft navigation.

(() => {
  const softNavs = [];    // { navigationId, startTime, name, url }
  const lcpEntries = [];  // { navigationId, startTime, size, url, element, tag, softNav: boolean }
  const formatMs = (ms) => `${Math.round(ms)}ms`;
  const valueToRating = (ms) => ms <= 2500 ? "good" : ms <= 4000 ? "needs-improvement" : "poor";

  const describeElement = (el) => {
    if (!el) return null;
    const tag = el.tagName?.toLowerCase();
    let selector = tag;
    if (el.id) selector = `#${el.id}`;
    else if (typeof el.className === "string" && el.className.trim()) {
      const classes = el.className.trim().split(/\s+/).slice(0, 2).join(".");
      if (classes) selector = `${tag}.${classes}`;
    }
    return { tag, selector };
  };

  let softNavSupported = false;
  let lcpSupported = false;

  try {
    const snObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        softNavs.push({
          navigationId: entry.navigationId,
          startTime: entry.startTime,
          name: entry.name,
          url: location.href,
        });
        console.log(`%c🧭 Soft nav detected @ ${formatMs(entry.startTime)} (${entry.name})`, "color: #3b82f6; font-weight: bold;");
      }
    });
    snObserver.observe({ type: "soft-navigation", buffered: true });
    softNavSupported = true;
  } catch (e) {
    console.warn("soft-navigation entries not supported by this browser:", e.message);
  }

  try {
    const lcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const desc = describeElement(entry.element);
        lcpEntries.push({
          navigationId: entry.navigationId || null,
          startTime: entry.startTime,
          size: entry.size,
          url: entry.url || null,
          selector: desc?.selector || null,
          tag: desc?.tag || null,
        });
      }
    });
    lcpObserver.observe({
      type: "largest-contentful-paint",
      buffered: true,
      includeSoftNavigationObservations: true,
    });
    lcpSupported = true;
  } catch (e) {
    console.warn("LCP with soft-nav observations not supported:", e.message);
  }

  const summarize = () => {
    const navById = new Map(softNavs.map((n) => [n.navigationId, n]));
    const perNav = softNavs.map((nav) => {
      const matching = lcpEntries.filter((l) => l.navigationId === nav.navigationId);
      const lastLcp = matching.at(-1) || null;
      const clickToLcp = lastLcp ? lastLcp.startTime - nav.startTime : null;
      return {
        navigationId: nav.navigationId,
        startTime: Math.round(nav.startTime),
        softNavName: nav.name,
        lcp: lastLcp ? {
          startTime: Math.round(lastLcp.startTime),
          clickToLcpMs: clickToLcp !== null ? Math.round(clickToLcp) : null,
          clickToLcpRating: clickToLcp !== null ? valueToRating(clickToLcp) : null,
          selector: lastLcp.selector,
          tag: lastLcp.tag,
          url: lastLcp.url,
          size: lastLcp.size,
        } : null,
      };
    });
    return perNav;
  };

  window.getSoftNavLCP = () => {
    const perNav = summarize();
    if (perNav.length === 0) {
      console.log("%c❌ No soft navigations observed yet.", "color: #f59e0b;");
      console.log("   Trigger a Link click, then call getSoftNavLCP() again.");
      return { script: "Soft-Nav-LCP", status: "tracking", softNavSupported, lcpSupported, softNavs: [] };
    }
    console.group("%c🧭 Soft-Nav LCP Summary", "font-weight: bold; font-size: 14px;");
    perNav.forEach((nav, i) => {
      console.log(`#${i + 1} @ ${nav.startTime}ms — ${nav.softNavName}`);
      if (nav.lcp) {
        console.log(`   Click→LCP: ${nav.lcp.clickToLcpMs}ms (${nav.lcp.clickToLcpRating})`);
        console.log(`   LCP element: ${nav.lcp.selector}`);
        if (nav.lcp.url) console.log(`   LCP resource: ${nav.lcp.url}`);
      } else {
        console.log("   (no LCP entry yet for this nav)");
      }
    });
    console.groupEnd();
    return {
      script: "Soft-Nav-LCP", status: "ok",
      softNavSupported, lcpSupported,
      count: perNav.length,
      softNavs: perNav,
    };
  };

  console.log("%c🧭 Soft-Nav LCP tracking active", "font-weight: bold; font-size: 14px;");
  console.log(`   soft-navigation entries: ${softNavSupported ? "✓" : "✗"}`);
  console.log(`   LCP (softNav-aware): ${lcpSupported ? "✓" : "✗"}`);
  console.log("   Trigger a Link click, then call getSoftNavLCP().");

  return {
    script: "Soft-Nav-LCP", status: "tracking",
    softNavSupported, lcpSupported,
    getDataFn: "getSoftNavLCP",
    message: "Trigger a soft navigation then call getSoftNavLCP().",
  };
})();
