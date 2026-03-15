export default function rehypeSectionize() {
  return (tree: any) => {
    const sections: { heading: any | null; content: any[] }[] = [];
    let currentSection: { heading: any | null; content: any[] } | null = null;

    for (const node of tree.children) {
      const isHeading =
        node.type === "element" &&
        (node.tagName === "h1" || node.tagName === "h2");

      if (isHeading) {
        if (currentSection) sections.push(currentSection);
        currentSection = { heading: node, content: [] };
      } else if (node.type === "text" && !node.value.trim()) {
        continue;
      } else {
        if (!currentSection) {
          currentSection = { heading: null, content: [] };
        }
        currentSection.content.push(node);
      }
    }

    if (currentSection) sections.push(currentSection);

    tree.children = sections.map((section) => ({
      type: "element",
      tagName: "section",
      properties: { className: ["article-section"] },
      children: [
        {
          type: "element",
          tagName: "div",
          properties: { className: ["section-heading"] },
          children: section.heading ? [section.heading] : [],
        },
        {
          type: "element",
          tagName: "div",
          properties: { className: ["section-content"] },
          children: section.content,
        },
      ],
    }));
  };
}
