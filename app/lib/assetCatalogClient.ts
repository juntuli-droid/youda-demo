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

export async function loadAssetCatalog() {
  if (typeof window === "undefined") return null

  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    try {
      return JSON.parse(cached) as AssetCatalog
    } catch {
      localStorage.removeItem(cacheKey)
    }
  }

  const response = await fetch("/assets/catalog.json", { cache: "force-cache" })
  if (!response.ok) return null
  const catalog = (await response.json()) as AssetCatalog
  localStorage.setItem(cacheKey, JSON.stringify(catalog))
  return catalog
}
