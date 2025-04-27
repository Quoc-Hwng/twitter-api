import { z } from 'zod'
import { ObjectId } from 'mongodb'

export const LikeSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.instanceof(ObjectId),
  tweetId: z.instanceof(ObjectId),
  createdAt: z.date().default(new Date())
})

export type LikeType = z.infer<typeof LikeSchema>
