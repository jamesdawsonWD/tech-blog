import { withContentHash } from "./asset-hash"

const HASHABLE_TAGS = new Set(["video", "img", "source", "audio"])
const HASHABLE_ATTRS = new Set(["src", "poster"])

function visit(node: any) {
  if (!node || typeof node !== "object") return

  if (node.type === "element" && HASHABLE_TAGS.has(node.tagName)) {
    const props = node.properties ?? {}
    for (const attr of HASHABLE_ATTRS) {
      if (typeof props[attr] === "string") {
        props[attr] = withContentHash(props[attr])
      }
    }
  }

  if (
    (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
    HASHABLE_TAGS.has(node.name)
  ) {
    for (const attr of node.attributes ?? []) {
      if (
        attr.type === "mdxJsxAttribute" &&
        HASHABLE_ATTRS.has(attr.name) &&
        typeof attr.value === "string"
      ) {
        attr.value = withContentHash(attr.value)
      }
    }
  }

  for (const child of node.children ?? []) visit(child)
}

export default function rehypeAssetHash() {
  return (tree: any) => visit(tree)
}
