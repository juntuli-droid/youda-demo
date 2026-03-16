export const DEMO_FLOW_KEYS = [
  "personalityScores",
  "personalityResultMeta",
  "latestMatchDraft",
  "vlogPrefill",
  "demoSessionId",
  "personalityQuestionSeed",
  "gameCareerRecords",
  "gameVlogRecords"
] as const

export function resetDemoFlowStorage() {
  if (typeof window === "undefined") return

  DEMO_FLOW_KEYS.forEach((key) => {
    localStorage.removeItem(key)
  })
}

export function startNewDemoSession() {
  if (typeof window === "undefined") return

  resetDemoFlowStorage()

  const sessionId = `demo_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`

  localStorage.setItem("demoSessionId", sessionId)
}

export function ensureDemoSession() {
  if (typeof window === "undefined") return

  const sessionId = localStorage.getItem("demoSessionId")
  if (!sessionId) {
    localStorage.setItem(
      "demoSessionId",
      `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    )
  }
}