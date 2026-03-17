"use client"

export type AssetCatalog = {
  version: string
  updatedAt: string
  licensePolicy: string
  assets: Record<
    string,
    {
      portrait: string
      avatar: string
      banner: string
    }
  >
}

const cacheKey = "assetCatalogCache"
const cacheVersionKey = "assetCatalogCacheVersion"

export function resolveAssetUrl(url: string) {
  const cdnBase = process.env.NEXT_PUBLIC_ASSET_CDN_BASE_URL
  if (!cdnBase) return url
  if (!url.startsWith("/")) return url
  return `${cdnBase.replace(/\/$/, "")}${url}`
}

export async function loadAssetCatalog() {
  if (typeof window === "undefined") return null

  const cached = localStorage.getItem(cacheKey)
  const cachedVersion = localStorage.getItem(cacheVersionKey)
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as AssetCatalog
      if (cachedVersion && cachedVersion === parsed.version) {
        return parsed
      }
    } catch {
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(cacheVersionKey)
    }
  }

  const response = await fetch(resolveAssetUrl("/assets/catalog.json"), {
    cache: "force-cache"
  })
  if (!response.ok) return null
  const catalog = (await response.json()) as AssetCatalog
  localStorage.setItem(cacheKey, JSON.stringify(catalog))
  localStorage.setItem(cacheVersionKey, catalog.version)
  return catalog
}
