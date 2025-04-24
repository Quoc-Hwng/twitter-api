import { z } from 'zod'
import { TweetAudience, TweetType } from '~/constants/enum'
import { MediaSchema } from '~/models/schemas/Tweet.schema'

export const TweetBody = z
  .object({
    type: z.nativeEnum(TweetType),
    audience: z.nativeEnum(TweetAudience),
    content: z.string(),
    parentId: z
      .string()
      .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId')
      .nullable(),
    hashtags: z.array(z.string()),
    mentions: z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid userId')),
    medias: z.array(MediaSchema)
  })
  .strict()

export type TweetBodyType = z.infer<typeof TweetBody>

export const TweetRes = z.object({
  data: z.object({
    _id: z.string(),
    userId: z.string(),
    type: z.nativeEnum(TweetType),
    audience: z.nativeEnum(TweetAudience),
    content: z.string(),
    parentId: z.string().nullable(),
    hashtags: z.array(z.string()),
    mentions: z.array(z.string()),
    medias: z.array(MediaSchema),
    guestViews: z.number(),
    userViews: z.number()
  }),
  message: z.string()
})

export type TweetResType = z.infer<typeof TweetRes>
