import path from "path"
import { execFileSync } from "child_process"
import { posterVariantFor, regenerate } from "./lib/asset-pipeline"

const repoRoot = path.resolve(__dirname, "..")

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

regenerate({
  label: "posters",
  articlesDir: path.join(repoRoot, "articles"),
  publicDir: path.join(repoRoot, "public"),
  manifestPath: path.join(__dirname, ".video-poster-manifest.json"),
  pickSource: (data) =>
    typeof data.videoImage === "string" && data.videoImage.endsWith(".mp4")
      ? data.videoImage
      : undefined,
  derivedFor: posterVariantFor,
  transcode: extractFrame,
})
