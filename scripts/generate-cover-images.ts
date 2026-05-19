import path from "path"
import { execFileSync } from "child_process"
import { coverVariantFor, regenerate } from "./lib/asset-pipeline"

// Cover images shipped raw go through the cold Next image optimizer on first
// request, so an article opened cold shows the skeleton for 1-3s while the
// transcode runs. Video posters don't have this problem because prebuild bakes
// them into right-sized static files that are preloaded at high priority.
// This script gives cover images the same treatment: a 1280px static .cover.jpg
// alongside the source, regenerated only when the source changes.

const repoRoot = path.resolve(__dirname, "..")

// Re-exported so existing importers (lib/articles.ts) keep their import path.
export { coverVariantFor }

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

regenerate({
  label: "covers",
  articlesDir: path.join(repoRoot, "articles"),
  publicDir: path.join(repoRoot, "public"),
  manifestPath: path.join(__dirname, ".cover-image-manifest.json"),
  pickSource: (data) =>
    typeof data.coverImage === "string" && data.coverImage.startsWith("/")
      ? data.coverImage
      : undefined,
  derivedFor: coverVariantFor,
  transcode: resize,
})
