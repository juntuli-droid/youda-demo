import { mkdir, writeFile } from "node:fs/promises"
import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"
import crypto from "node:crypto"

const sourceDir = path.resolve("game_chars_png")
const mapPath = path.resolve("app/data/gameCharacterMap.json")
const displayDir = path.resolve("public/images/avatars/game-characters/display")
const avatarDir = path.resolve("public/images/avatars/game-characters/avatar")

function hashBuffer(buffer) {
  return crypto.createHash("sha1").update(buffer).digest("hex").slice(0, 8)
}

async function run() {
  const map = JSON.parse(fs.readFileSync(mapPath, "utf8"))
  await mkdir(displayDir, { recursive: true })
  await mkdir(avatarDir, { recursive: true })

  const analysis = []

  for (const [character, fileName] of Object.entries(map)) {
    const sourceFile = path.join(sourceDir, `${character}.png`)
    if (!fs.existsSync(sourceFile)) {
      throw new Error(`缺失源文件: ${sourceFile}`)
    }

    const source = sharp(sourceFile).rotate()
    const meta = await source.metadata()
    const raw = await source.toBuffer()
    const hash = hashBuffer(raw)
    const normalized = fileName.replace(".png", `_${hash}.png`)

    await sharp(raw)
      .resize(640, 640, {
        fit: "contain",
        background: { r: 14, g: 26, b: 37, alpha: 0 }
      })
      .png({ compressionLevel: 9, quality: 80 })
      .toFile(path.join(displayDir, normalized))

    await sharp(raw)
      .resize(512, 512, {
        fit: "cover",
        position: "attention"
      })
      .png({ compressionLevel: 9, quality: 82 })
      .toFile(path.join(avatarDir, normalized))

    map[character] = normalized
    analysis.push({
      character,
      width: meta.width || 0,
      height: meta.height || 0
    })
  }

  await writeFile(mapPath, `${JSON.stringify(map, null, 2)}\n`)

  const widths = analysis.map((item) => item.width).sort((a, b) => a - b)
  const heights = analysis.map((item) => item.height).sort((a, b) => a - b)
  const median = (list) => list[Math.floor(list.length / 2)] || 0
  const ratios = analysis
    .map((item) => (item.height ? item.width / item.height : 1))
    .sort((a, b) => a - b)

  await writeFile(
    path.resolve("docs/game-char-size-analysis.json"),
    JSON.stringify(
      {
        count: analysis.length,
        medianWidth: median(widths),
        medianHeight: median(heights),
        medianRatio: Number(median(ratios).toFixed(3)),
        displayWindow: {
          desktop: { width: 400, height: 250 },
          tablet: { width: 344, height: 216 },
          mobile: { width: 288, height: 180 }
        },
        note: "展示图统一采用640x640容器图，页面窗口使用16:10以保证视觉平衡；头像统一512x512注意力裁剪。",
        analysis
      },
      null,
      2
    )
  )
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
