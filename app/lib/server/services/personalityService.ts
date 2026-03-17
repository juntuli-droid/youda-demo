import { questions } from "../../../data/personalityQuestions"
import {
  calculatePersonality,
  getFrequencyLabel,
  getPersonalityMeta
} from "../../personalityEngine"
import { badRequest } from "../errors"
import {
  replacePersonalityAnswers,
  upsertPersonalityProfile,
  updateUserAvatarByCharacter
} from "../repositories/coreRepository"

type SubmittedAnswer = {
  questionId: number
  optionValue: string
}

export async function submitPersonalityAnswers(args: {
  userId: string
  answers: SubmittedAnswer[]
}) {
  const scoreMap: Record<string, number> = {}

  for (const answer of args.answers) {
    const question = questions.find((item) => item.id === answer.questionId)
    if (!question) {
      throw badRequest(`题目不存在: ${answer.questionId}`)
    }

    const option = question.options.find((item) => item.label === answer.optionValue)
    if (!option) {
      throw badRequest(`答案不合法: ${answer.questionId}`)
    }

    Object.entries(option.score).forEach(([key, value]) => {
      scoreMap[key] = (scoreMap[key] || 0) + Number(value || 0)
    })
  }

  const personality = calculatePersonality(scoreMap)
  const meta = getPersonalityMeta(personality.code)

  await replacePersonalityAnswers({
    userId: args.userId,
    answers: args.answers.map((item) => ({
      questionId: item.questionId,
      answerValue: item.optionValue
    }))
  })

  await upsertPersonalityProfile({
    userId: args.userId,
    styleCode: personality.style,
    personalityCode: personality.personality,
    preferenceCode: personality.preference,
    activityTag: personality.frequency,
    fullCode: personality.code,
    summaryText: meta.description,
    character: meta.character
  })

  await updateUserAvatarByCharacter({
    userId: args.userId,
    character: meta.character
  })

  return {
    fullCode: personality.code,
    title: meta.title,
    description: meta.description,
    frequencyLabel: getFrequencyLabel(personality.frequency)
  }
}
