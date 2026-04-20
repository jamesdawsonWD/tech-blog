// Content-Visibility audit — detects existing usage AND finds candidates
// Source: https://webperf-snippets.nucliweb.net/Loading/Content-Visibility

function detectContentVisibility() {
  const results = { autoElements: [], hiddenElements: [], nodeArray: [] };
  function getName(node) {
    const name = node.nodeName;
    return node.nodeType === 1 ? name.toLowerCase() : name.toUpperCase().replace(/^#/, "");
  }
  function getSelector(node) {
    let sel = "";
    try {
      while (node && node.nodeType !== 9) {
        const el = node;
        const part = el.id ? "#" + el.id :
          getName(el) + (el.classList?.value?.trim() ? "." + el.classList.value.trim().replace(/\s+/g, ".") : "");
        if (sel.length + part.length > 99) return sel || part;
        sel = sel ? part + ">" + sel : part;
        if (el.id) break;
        node = el.parentNode;
      }
    } catch {}
    return sel;
  }
  function isInViewport(el) {
    const r = el.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0 && r.left < innerWidth && r.right > 0;
  }
  function getElementInfo(node) {
    const rect = node.getBoundingClientRect();
    const cs = getComputedStyle(node);
    return {
      selector: getSelector(node),
      contentVisibility: cs["content-visibility"],
      containIntrinsicSize: cs["contain-intrinsic-size"] || "not set",
      width: Math.round(rect.width), height: Math.round(rect.height),
      top: Math.round(rect.top + scrollY), inViewport: isInViewport(node),
    };
  }
  function walk(node) {
    const cv = getComputedStyle(node)["content-visibility"];
    if (cv && cv !== "visible") {
      const info = getElementInfo(node);
      if (cv === "auto") { results.autoElements.push(info); results.nodeArray.push(node); }
      else if (cv === "hidden") results.hiddenElements.push(info);
    }
    for (let i = 0; i < node.children.length; i++) walk(node.children[i]);
  }
  walk(document.body);
  console.group("🔍 Content-Visibility Detection");
  if (results.autoElements.length === 0 && results.hiddenElements.length === 0) {
    console.log("No content-visibility usage found.");
    console.log("💡 Run analyzeContentVisibilityOpportunities() to find candidates.");
  } else {
    if (results.autoElements.length > 0) { console.group(`✅ auto (${results.autoElements.length})`); console.table(results.autoElements); console.groupEnd(); }
    if (results.hiddenElements.length > 0) { console.group(`🔒 hidden (${results.hiddenElements.length})`); console.table(results.hiddenElements); console.groupEnd(); }
    const missing = results.autoElements.filter((el) => el.containIntrinsicSize === "not set" || el.containIntrinsicSize === "none");
    if (missing.length > 0) {
      console.group("⚠️ Missing contain-intrinsic-size (CLS risk)");
      console.table(missing.map((el) => ({ selector: el.selector, height: el.height + "px" })));
      console.groupEnd();
    }
  }
  console.groupEnd();
  return results;
}

function analyzeContentVisibilityOpportunities(options = {}) {
  const { threshold = 0, minHeight = 100, minChildren = 5 } = options;
  const opportunities = [];
  const processed = new Set();
  function getSelector(node) {
    let sel = "";
    try {
      while (node && node.nodeType !== 9) {
        const el = node;
        const name = el.nodeName.toLowerCase();
        const part = el.id ? "#" + el.id :
          name + (el.classList?.value?.trim() ? "." + el.classList.value.trim().split(/\s+/).slice(0, 2).join(".") : "");
        if (sel.length + part.length > 80) return sel || part;
        sel = sel ? part + ">" + sel : part;
        if (el.id) break;
        node = el.parentNode;
      }
    } catch {}
    return sel;
  }
  function estimateSavings(count) {
    const ms = count * 0.2;
    if (ms < 5) return `Low (~${ms.toFixed(1)}ms)`;
    if (ms < 20) return `Medium (~${ms.toFixed(1)}ms)`;
    return `High (~${ms.toFixed(1)}ms)`;
  }
  function ancestorProcessed(el) {
    let p = el.parentElement;
    while (p) { if (processed.has(p)) return true; p = p.parentElement; }
    return false;
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null, false);
  while (walker.nextNode()) {
    const el = walker.currentNode;
    if (processed.has(el) || ancestorProcessed(el)) continue;
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (cs["content-visibility"] && cs["content-visibility"] !== "visible") continue;
    if (rect.height < minHeight || rect.width === 0) continue;
    const distance = rect.top - innerHeight;
    if (distance < threshold) continue;
    const count = el.querySelectorAll("*").length;
    if (count < minChildren) continue;
    processed.add(el);
    opportunities.push({
      selector: getSelector(el), height: Math.round(rect.height) + "px",
      distanceFromViewport: Math.round(distance) + "px",
      childElements: count, estimatedSavings: estimateSavings(count), element: el,
    });
  }
  opportunities.sort((a, b) => b.childElements - a.childElements);
  console.group("💡 Content-Visibility Opportunities");
  if (opportunities.length === 0) console.log("No opportunities found.");
  else {
    console.log(`Found ${opportunities.length} candidate(s)`);
    console.table(opportunities.slice(0, 20).map((o) => ({ selector: o.selector, height: o.height, distanceFromViewport: o.distanceFromViewport, childElements: o.childElements, estimatedSavings: o.estimatedSavings })));
  }
  console.groupEnd();
  return {
    opportunities: opportunities.map((o) => ({ selector: o.selector, height: o.height, distanceFromViewport: o.distanceFromViewport, childElements: o.childElements, estimatedSavings: o.estimatedSavings })),
    totalElements: opportunities.length,
    highImpact: opportunities.filter((o) => o.estimatedSavings.startsWith("High")).length,
  };
}
window.analyzeContentVisibilityOpportunities = analyzeContentVisibilityOpportunities;

(() => {
  const r = detectContentVisibility();
  console.log("%c→ Run analyzeContentVisibilityOpportunities() to find candidates", "color: #22c55e;");
  return {
    script: "Content-Visibility", status: "ok",
    count: r.autoElements.length + r.hiddenElements.length,
    details: { autoCount: r.autoElements.length, hiddenCount: r.hiddenElements.length },
    items: [...r.autoElements.map(el => ({ ...el, type: "auto" })), ...r.hiddenElements.map(el => ({ ...el, type: "hidden" }))],
    issues: r.autoElements
      .filter(el => el.containIntrinsicSize === "not set" || el.containIntrinsicSize === "none")
      .map(el => ({ severity: "warning", message: `${el.selector}: missing contain-intrinsic-size (CLS risk)` })),
  };
})();
