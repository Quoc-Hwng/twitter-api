import { z } from 'zod'
import { ObjectId } from 'mongodb'

export const HashtagSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string(),
  createdAt: z.date().default(new Date())
})

export type HashtagType = z.infer<typeof HashtagSchema>
