import { z } from 'zod'
import { ObjectId } from 'mongodb'

export const BookmarkSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.instanceof(ObjectId),
  tweetId: z.instanceof(ObjectId),
  createdAt: z.date().default(new Date())
})

export type BookmarkType = z.infer<typeof BookmarkSchema>
