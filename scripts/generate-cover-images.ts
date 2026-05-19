import crypto from "crypto"
import fs from "fs"
import path from "path"
import { execFileSync } from "child_process"
import matter from "gray-matter"

// Cover images shipped raw go through the cold Next image optimizer on first
// request, so an article opened cold shows the skeleton for 1-3s while the
// transcode runs. Video posters don't have this problem because prebuild bakes
// them into right-sized static files that are preloaded at high priority.
// This script gives cover images the same treatment: a 1280px static .cover.jpg
// alongside the source, regenerated only when the source changes.

const repoRoot = path.resolve(__dirname, "..")
const articlesDir = path.join(repoRoot, "articles")
const publicDir = path.join(repoRoot, "public")
const manifestPath = path.join(__dirname, ".cover-image-manifest.json")

type Manifest = Record<string, string>

function hashFile(filePath: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex")
    .slice(0, 8)
}

function readManifest(): Manifest {
  if (!fs.existsSync(manifestPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"))
  } catch {
    return {}
  }
}

function collectCoverImages(): string[] {
  const covers = new Set<string>()
  for (const file of fs.readdirSync(articlesDir)) {
    if (!file.endsWith(".mdx")) continue
    const { data } = matter(fs.readFileSync(path.join(articlesDir, file), "utf8"))
    if (typeof data.coverImage === "string" && data.coverImage.startsWith("/")) {
      covers.add(data.coverImage)
    }
  }
  return Array.from(covers)
}

export function coverVariantFor(coverPath: string): string {
  return `${coverPath.replace(/\.[^.]+$/, "")}.cover.jpg`
}

function resize(sourceAbs: string, outAbs: string) {
  // Same encode settings as the video-poster pipeline for consistency:
  // 1280px wide (plenty for the 1024px container at DPR>1), q:v 3.
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i", sourceAbs,
      "-vf", "scale='min(1280,iw)':-2",
      "-q:v", "3",
      outAbs,
    ],
    { stdio: ["ignore", "ignore", "ignore"] },
  )
}

function main() {
  const manifest = readManifest()
  const covers = collectCoverImages()
  let regenerated = 0

  for (const coverPath of covers) {
    const sourceAbs = path.join(publicDir, coverPath)
    if (!fs.existsSync(sourceAbs)) {
      console.warn(`[covers] skip: ${coverPath} not found on disk`)
      continue
    }

    const sourceHash = hashFile(sourceAbs)
    const variantRel = coverVariantFor(coverPath)
    const variantAbs = path.join(publicDir, variantRel)
    const variantExists = fs.existsSync(variantAbs)

    if (variantExists && manifest[coverPath] === sourceHash) continue

    console.log(`[covers] regenerating ${variantRel} (source hash ${sourceHash})`)
    resize(sourceAbs, variantAbs)
    manifest[coverPath] = sourceHash
    regenerated++
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n")
  if (regenerated === 0) console.log("[covers] up to date")
  else console.log(`[covers] regenerated ${regenerated}`)
}

main()
