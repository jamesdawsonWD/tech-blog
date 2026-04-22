import crypto from "crypto"
import fs from "fs"
import path from "path"

const publicDirectory = path.join(process.cwd(), "public")
const hashCache = new Map<string, string>()

export function withContentHash(publicPath: string | undefined): string | undefined {
  if (!publicPath || !publicPath.startsWith("/") || publicPath.startsWith("//")) {
    return publicPath
  }
  if (hashCache.has(publicPath)) return hashCache.get(publicPath)

  const [pathOnly] = publicPath.split("?")
  const diskPath = path.join(publicDirectory, pathOnly)
  if (!fs.existsSync(diskPath)) return publicPath

  const hash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(diskPath))
    .digest("hex")
    .slice(0, 8)
  const separator = publicPath.includes("?") ? "&" : "?"
  const hashed = `${publicPath}${separator}v=${hash}`
  hashCache.set(publicPath, hashed)
  return hashed
}
