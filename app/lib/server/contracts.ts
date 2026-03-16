import { z } from "zod"

export const personalitySubmitSchema = z.object({
  sessionId: z.string().min(1),
  answers: z
    .array(
      z.object({
        questionId: z.number().int().positive(),
        optionValue: z.string().min(1)
      })
    )
    .length(16)
})

export const matchRequestCreateSchema = z.object({
  game: z.string().optional(),
  gameId: z.string().uuid().optional(),
  ownStyle: z.string().min(1),
  targetStyle: z.string().min(1),
  teamSize: z.string().min(1)
})

export const roomMessageCreateSchema = z.object({
  content: z.string().min(1).max(1000),
  type: z.enum(["user", "system"]).optional()
})

export const roomMemberUpdateSchema = z.object({
  readyStatus: z.boolean().optional(),
  voiceStatus: z.string().min(1).max(64).optional()
})

export const phoneAuthRegisterSchema = z.object({
  nickname: z.string().trim().min(2).max(20),
  phone: z.string().regex(/^1\d{10}$/),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
})

export const phoneAuthLoginSchema = z.object({
  phone: z.string().regex(/^1\d{10}$/),
  password: z.string().min(6),
  captchaAnswer: z.string().trim().min(1).optional()
})
