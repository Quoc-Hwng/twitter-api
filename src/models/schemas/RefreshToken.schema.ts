import { ObjectId } from 'mongodb'
import z from 'zod'

export const RefreshToken = z.object({
  _id: z.instanceof(ObjectId).optional(),
  token: z.string(),
  userId: z.instanceof(ObjectId),
  createdAt: z.date().default(new Date()),
  iat: z.number().transform((value) => new Date(value * 1000)), // Chuyển Epoch thành Date
  exp: z.number().transform((value) => new Date(value * 1000)) // Chuyển Epoch thành Date
})

export type RefreshTokenType = z.infer<typeof RefreshToken>
