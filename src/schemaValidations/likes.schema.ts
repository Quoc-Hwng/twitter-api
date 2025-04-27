import z from 'zod'

export const LikeTweetBody = z.object({
  tweetId: z.string()
})

export type LikeTweetBodyType = z.infer<typeof LikeTweetBody>

export const LikeTweetRes = z.object({
  data: z.object({
    _id: z.string()
  }),
  message: z.string()
})

export type LikeTweetResType = z.infer<typeof LikeTweetRes>
