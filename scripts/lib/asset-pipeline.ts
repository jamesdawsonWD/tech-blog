import crypto from "crypto"
import fs from "fs"
import path from "path"
import matter from "gray-matter"

// Shared core for the prebuild asset generators (cover images, video posters).
// Both generators have the same shape: collect a set of source assets declared
// in article frontmatter, hash each source, and regenerate a derived file only
// when the source changed (tracked in a JSON manifest). Only the frontmatter
// field, the source/derived path mapping, and the ffmpeg invocation differ.

export type Manifest = Record<string, string>

export function hashFile(filePath: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex")
    .slice(0, 8)
}

export function readManifest(manifestPath: string): Manifest {
  if (!fs.existsSync(manifestPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"))
  } catch {
    return {}
  }
}

export function writeManifest(manifestPath: string, manifest: Manifest): void {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n")
}

// Pure helper: maps a public cover source path to its prebuilt static variant.
// Single source of truth shared with lib/articles.ts so the runtime contract
// and the generated filenames can never drift apart.
export function coverVariantFor(coverPath: string): string {
  return `${coverPath.replace(/\.[^.]+$/, "")}.cover.jpg`
}

// Pure helper: maps a public .mp4 path to its extracted poster path.
export function posterVariantFor(videoPath: string): string {
  return `${videoPath.replace(/\.mp4$/, "")}.poster.jpg`
}

function collectFrontmatterAssets(
  articlesDir: string,
  pick: (data: Record<string, unknown>) => string | undefined,
): string[] {
  const assets = new Set<string>()
  for (const file of fs.readdirSync(articlesDir)) {
    if (!file.endsWith(".mdx")) continue
    const { data } = matter(fs.readFileSync(path.join(articlesDir, file), "utf8"))
    const value = pick(data)
    if (typeof value === "string") assets.add(value)
  }
  return Array.from(assets)
}

export interface RegenerateConfig {
  // Short label used in log lines, e.g. "covers" / "posters".
  label: string
  articlesDir: string
  publicDir: string
  manifestPath: string
  // Pull the relevant source path out of one article's frontmatter, or return
  // undefined to skip it.
  pickSource: (data: Record<string, unknown>) => string | undefined
  // Map a source public path to its derived public path.
  derivedFor: (sourcePath: string) => string
  // Run the actual transcode from an absolute source to an absolute output.
  transcode: (sourceAbs: string, outAbs: string) => void
}

export function regenerate(config: RegenerateConfig): void {
  const { label, articlesDir, publicDir, manifestPath, pickSource, derivedFor, transcode } =
    config

  const manifest = readManifest(manifestPath)
  const sources = collectFrontmatterAssets(articlesDir, pickSource)
  let regenerated = 0

  for (const sourcePath of sources) {
    const sourceAbs = path.join(publicDir, sourcePath)
    if (!fs.existsSync(sourceAbs)) {
      console.warn(`[${label}] skip: ${sourcePath} not found on disk`)
      continue
    }

    const sourceHash = hashFile(sourceAbs)
    const derivedRel = derivedFor(sourcePath)
    const derivedAbs = path.join(publicDir, derivedRel)
    const derivedExists = fs.existsSync(derivedAbs)

    if (derivedExists && manifest[sourcePath] === sourceHash) continue

    console.log(`[${label}] regenerating ${derivedRel} (source hash ${sourceHash})`)
    transcode(sourceAbs, derivedAbs)
    manifest[sourcePath] = sourceHash
    regenerated++
  }

  writeManifest(manifestPath, manifest)
  if (regenerated === 0) console.log(`[${label}] up to date`)
  else console.log(`[${label}] regenerated ${regenerated}`)
}
