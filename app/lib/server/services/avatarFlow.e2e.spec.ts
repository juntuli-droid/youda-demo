import { describe, expect, it } from "vitest"
import { getMemoryStore } from "../memoryStore"
import { submitPersonalityAnswers } from "./personalityService"
import { questions } from "../../../data/personalityQuestions"

describe("avatar flow e2e (register -> test -> avatar init)", () => {
  it("initializes avatar path after first personality submit", async () => {
    const store = getMemoryStore()
    const userId = "e2e-user-1"

    store.users.set(userId, {
      id: userId,
      authUserId: "local_phone_10000000000",
      nickname: "测试用户",
      authProvider: "local",
      avatarUrl: "/images/avatars/default.png"
    })

    const answers = questions.slice(0, 16).map((question) => ({
      questionId: question.id,
      optionValue: question.options[0].label
    }))

    await submitPersonalityAnswers({
      userId,
      answers
    })

    const user = store.users.get(userId)
    expect(user).toBeTruthy()
    expect(user?.avatarUrl).toContain("/images/avatars/")
    expect(user?.avatarUrl).not.toBe("/images/avatars/default.png")
  })
})
