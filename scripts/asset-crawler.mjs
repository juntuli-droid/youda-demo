import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const targets = [
  {
    name: "sample-source-1",
    url: "https://example.com/gallery"
  },
  {
    name: "sample-source-2",
    url: "https://example.org/media"
  }
]

async function crawlPage(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`抓取失败: ${url}`)
  }
  const html = await response.text()
  const matches = [...html.matchAll(/https?:\/\/[^"' )]+\.(png|jpg|jpeg|webp)/gi)]
  return [...new Set(matches.map((item) => item[0]))]
}

async function run() {
  const outputDir = path.resolve("tmp/crawled-assets")
  await mkdir(outputDir, { recursive: true })

  const summary = []
  for (const target of targets) {
    const links = await crawlPage(target.url)
    const file = path.join(outputDir, `${target.name}.json`)
    await writeFile(file, JSON.stringify({ source: target.url, links }, null, 2))
    summary.push({
      source: target.url,
      count: links.length,
      output: file
    })
  }

  await writeFile(
    path.join(outputDir, "summary.json"),
    JSON.stringify(summary, null, 2)
  )

  console.log("采集完成，结果位于 tmp/crawled-assets")
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
