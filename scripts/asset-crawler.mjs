import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { load as loadHtml } from "cheerio"
import sharp from "sharp"

const headers = {
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml"
}

function normalizeSrc(src) {
  if (src.startsWith("//")) return `https:${src}`
  return src
}

async function crawlPage(url, allowedDomains) {
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`抓取失败: ${url}`)
  }

  const html = await response.text()
  const $ = loadHtml(html)
  const links = new Set()

  $("img").each((_, node) => {
    const src = normalizeSrc($(node).attr("src") || "")
    if (!src.startsWith("http")) return
    if (!/\.(png|jpg|jpeg|webp)/i.test(src)) return
    const host = new URL(src).host
    if (allowedDomains.length > 0 && !allowedDomains.some((item) => host.includes(item))) {
      return
    }
    links.add(src)
  })

  return [...links]
}

async function downloadAndTransform(url, outputBasePath) {
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`下载失败: ${url}`)
  }
  const bytes = Buffer.from(await response.arrayBuffer())
  const image = sharp(bytes).resize(900, 1200, {
    fit: "cover"
  })
  await image.clone().webp({ quality: 80 }).toFile(`${outputBasePath}.webp`)
  await image.clone().png({ compressionLevel: 8 }).toFile(`${outputBasePath}.png`)
  await image.clone().jpeg({ quality: 82 }).toFile(`${outputBasePath}.jpg`)
}

async function run() {
  const sourceConfigPath = path.resolve("scripts/assets-sources.json")
  const sourceConfigRaw = await readFile(sourceConfigPath, "utf8")
  const sourceConfig = JSON.parse(sourceConfigRaw)

  const outputDir = path.resolve("tmp/crawled-assets")
  const downloadDir = path.resolve("public/assets/gameImages")
  await mkdir(outputDir, { recursive: true })
  await mkdir(downloadDir, { recursive: true })
  await mkdir(path.join(downloadDir, "avatar"), { recursive: true })
  await mkdir(path.join(downloadDir, "background"), { recursive: true })
  await mkdir(path.join(downloadDir, "icon"), { recursive: true })
  await mkdir(path.join(downloadDir, "banner"), { recursive: true })

  const summary = []
  for (const target of sourceConfig.sources) {
    let links = []
    try {
      links = target.directImages?.length
        ? target.directImages
        : await crawlPage(target.url, target.allowedDomains || [])
    } catch (error) {
      summary.push({
        name: target.name,
        source: target.url,
        count: 0,
        error: error instanceof Error ? error.message : "抓取失败",
        downloaded: 0,
        outputs: []
      })
      continue
    }
    const file = path.join(outputDir, `${target.name}.json`)
    await writeFile(file, JSON.stringify({ source: target.url, links }, null, 2))
    const picked = links.slice(0, 8)
    const outputs = []
    for (let i = 0; i < picked.length; i += 1) {
      const link = picked[i]
      const category = i < 12 ? "avatar" : "banner"
      const basePath = path.join(
        downloadDir,
        category,
        `character-${String(i + 1).padStart(2, "0")}`
      )
      try {
        await downloadAndTransform(link, basePath)
        outputs.push({
          source: link,
          files: [
            `${basePath}.webp`,
            `${basePath}.png`,
            `${basePath}.jpg`
          ]
        })
      } catch {
      }
    }

    summary.push({
      name: target.name,
      source: target.url,
      count: links.length,
      manifest: file,
      downloaded: outputs.length,
      outputs
    })
  }

  await writeFile(
    path.join(outputDir, "summary.json"),
    JSON.stringify(summary, null, 2)
  )

  console.log("采集完成，链接清单位于 tmp/crawled-assets，资源位于 public/assets/gameImages")
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
