import crypto from "crypto"
import fs from "fs"
import path from "path"
import { execFileSync } from "child_process"
import matter from "gray-matter"

const repoRoot = path.resolve(__dirname, "..")
const articlesDir = path.join(repoRoot, "articles")
const publicDir = path.join(repoRoot, "public")
const manifestPath = path.join(__dirname, ".video-poster-manifest.json")

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

function collectVideoImages(): string[] {
  const videos = new Set<string>()
  for (const file of fs.readdirSync(articlesDir)) {
    if (!file.endsWith(".mdx")) continue
    const { data } = matter(fs.readFileSync(path.join(articlesDir, file), "utf8"))
    if (typeof data.videoImage === "string" && data.videoImage.endsWith(".mp4")) {
      videos.add(data.videoImage)
    }
  }
  return Array.from(videos)
}

function posterPathFor(videoPath: string): string {
  const base = videoPath.replace(/\.mp4$/, "")
  return `${base}.poster.jpg`
}

function extractFrame(videoAbs: string, posterAbs: string) {
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-ss", "0",
      "-i", videoAbs,
      "-vframes", "1",
      "-vf", "scale=1280:-2",
      "-q:v", "3",
      posterAbs,
    ],
    { stdio: ["ignore", "ignore", "ignore"] },
  )
}

function main() {
  const manifest = readManifest()
  const videos = collectVideoImages()
  let regenerated = 0

  for (const videoPath of videos) {
    const videoAbs = path.join(publicDir, videoPath)
    if (!fs.existsSync(videoAbs)) {
      console.warn(`[posters] skip: ${videoPath} not found on disk`)
      continue
    }

    const videoHash = hashFile(videoAbs)
    const posterAbs = path.join(publicDir, posterPathFor(videoPath))
    const posterExists = fs.existsSync(posterAbs)
    const manifestHash = manifest[videoPath]

    if (posterExists && manifestHash === videoHash) continue

    console.log(`[posters] regenerating ${posterPathFor(videoPath)} (video hash ${videoHash})`)
    extractFrame(videoAbs, posterAbs)
    manifest[videoPath] = videoHash
    regenerated++
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n")
  if (regenerated === 0) console.log("[posters] up to date")
  else console.log(`[posters] regenerated ${regenerated}`)
}

main()
