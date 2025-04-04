import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { FollowStatus } from '~/constants/enum'

export const FollowerSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  followerId: z.instanceof(ObjectId), // Người theo dõi
  followingId: z.instanceof(ObjectId), // Người được theo dõi
  followStatus: z.nativeEnum(FollowStatus),
  createdAt: z.date().default(new Date())
})

export type FollowerType = z.infer<typeof FollowerSchema>
