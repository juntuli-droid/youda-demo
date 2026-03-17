import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const targets = [
  ["源氏", "genji_main.png", "character-01.png"],
  ["奎托斯", "kratos_main.png", "character-02.png"],
  ["猎空", "tracer_main.png", "character-03.png"],
  ["布里吉塔", "brigitte_main.png", "character-04.png"],
  ["克劳德", "cloud_main.png", "character-05.png"],
  ["米法", "mipha_main.png", "character-06.png"],
  ["林克", "link_main.png", "character-07.png"],
  ["2B", "yorha_2b_main.png", "character-08.png"],
  ["派蒙", "paimon_main.png", "character-09.png"],
  ["艾希", "ashe_main.png", "character-10.png"],
  ["杰洛特", "geralt_main.png", "character-11.png"],
  ["吉尔", "jill_main.png", "character-12.png"],
  ["温斯顿", "winston_main.png", "character-13.png"],
  ["阿米娅", "amiya_main.png", "character-14.png"],
  ["马力欧", "mario_main.png", "character-15.png"],
  ["里昂", "leon_main.png", "character-16.png"],
  ["蒂法", "tifa_main.png", "character-17.png"],
  ["艾洛伊", "aloy_main.png", "character-18.png"],
  ["卢西奥", "lucio_main.png", "character-19.png"],
  ["芭芭拉", "barbara_main.png", "character-20.png"],
  ["旅人", "traveler_main.png", "character-21.png"],
  ["天使", "mercy_main.png", "character-22.png"],
  ["吉安娜", "jaina_main.png", "character-23.png"],
  ["塞尔达", "zelda_main.png", "character-24.png"],
  ["卡比", "kirby_main.png", "character-25.png"],
  ["西施惠", "isabelle_main.png", "character-26.png"],
  ["皮克敏", "pikmin_main.png", "character-27.png"]
]

const root = path.resolve("public/images/avatars/game-characters")
const sourceRoot = path.resolve("public/assets/gameImages/avatar")

async function run() {
  await mkdir(root, { recursive: true })

  const manifest = {}

  for (const [name, output, source] of targets) {
    const sourcePath = path.join(sourceRoot, source)
    const outputPath = path.join(root, output)
    await sharp(sourcePath)
      .resize(640, 640, {
        fit: "contain",
        background: { r: 14, g: 26, b: 37, alpha: 1 }
      })
      .png({ compressionLevel: 9, quality: 80 })
      .toFile(outputPath)
    manifest[name] = output
  }

  await mkdir(path.resolve("app/data"), { recursive: true })
  await writeFile(
    path.resolve("app/data/gameCharacterMap.generated.json"),
    JSON.stringify(manifest, null, 2)
  )

  const placeholderSource = path.join(sourceRoot, "character-01.png")
  await sharp(placeholderSource)
    .resize(512, 512, { fit: "contain", background: { r: 14, g: 26, b: 37, alpha: 1 } })
    .png({ compressionLevel: 9, quality: 80 })
    .toFile(path.resolve("public/images/avatars/placeholder.png"))
  await sharp(placeholderSource)
    .resize(512, 512, { fit: "contain", background: { r: 14, g: 26, b: 37, alpha: 1 } })
    .png({ compressionLevel: 9, quality: 80 })
    .toFile(path.resolve("public/images/avatars/default.png"))
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
