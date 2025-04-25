import z from 'zod'

export const BookmarkTweetBody = z.object({
  tweetId: z.string()
})

export type BookmarkTweetBodyType = z.infer<typeof BookmarkTweetBody>

export const BookmarkTweetRes = z.object({
  data: z.object({
    _id: z.string()
  }),
  message: z.string()
})

export type BookmarkTweetResType = z.infer<typeof BookmarkTweetRes>

export const BookmarkQuery = z.object({
  page: z.number().optional(),
  limit: z.number().optional()
})

export type BookmarkQueryType = z.infer<typeof BookmarkQuery>
