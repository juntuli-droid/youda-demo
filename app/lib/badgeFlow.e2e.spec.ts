import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  addManualBadge,
  hasBadgeManagePermission,
  loadBadgeStore,
  removeBadgeById,
  toDisplayBadges
} from "./badgeStorage"

describe("badge flow e2e (manual add -> display -> delete)", () => {
  let storage: Map<string, string>

  beforeEach(() => {
    storage = new Map<string, string>()
    vi.stubGlobal("window", {})
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) || null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key)
    })
  })

  it("persists and removes a manual badge correctly", () => {
    const added = addManualBadge({
      name: "原神深渊",
      description: "12层满星",
      iconUrl: "/assets/gameImages/icon/icon-03.webp"
    })
    const storeAfterAdd = loadBadgeStore()
    expect(storeAfterAdd.manualBadges.length).toBe(1)
    expect(toDisplayBadges(storeAfterAdd)[0].id).toBe(added.id)

    const storeAfterDelete = removeBadgeById(added.id)
    expect(storeAfterDelete.manualBadges.length).toBe(0)
  })

  it("isolates badges between different login users", () => {
    localStorage.setItem(
      "authUserProfile",
      JSON.stringify({ phone: "13800000001", nickname: "A", provider: "phone" })
    )
    addManualBadge({
      name: "用户A徽章",
      description: "A",
      iconUrl: "/budget/成就1.png"
    })
    expect(loadBadgeStore().manualBadges.length).toBe(1)

    localStorage.setItem(
      "authUserProfile",
      JSON.stringify({ phone: "13800000002", nickname: "B", provider: "phone" })
    )
    expect(loadBadgeStore().manualBadges.length).toBe(0)
  })

  it("grants badge manage permission when profile exists without token", () => {
    localStorage.setItem(
      "authUserProfile",
      JSON.stringify({ phone: "13800000003", nickname: "C", provider: "phone" })
    )
    expect(hasBadgeManagePermission()).toBe(true)
  })
})
