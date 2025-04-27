import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { MediaType, TweetAudience, TweetType } from '~/constants/enum'

export const MediaSchema = z.object({
  url: z.string().url(),
  type: z.nativeEnum(MediaType)
})

export const TweetSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.instanceof(ObjectId),
  type: z.nativeEnum(TweetType),
  audience: z.nativeEnum(TweetAudience),
  content: z.string(),
  parentId: z.instanceof(ObjectId).or(z.literal(null)),
  hashtags: z.array(z.instanceof(ObjectId)),
  mentions: z.array(z.instanceof(ObjectId).or(z.string().regex(/^[a-f\d]{24}$/i))),
  medias: z.array(MediaSchema),
  guestViews: z.number().default(0),
  userViews: z.number().default(0),
  likeCount: z.number().default(0),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  _destroy: z.boolean().default(false)
})

export type Media = z.infer<typeof MediaSchema>
export type Tweet = z.infer<typeof TweetSchema>
