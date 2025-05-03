import { z } from 'zod'
import { PeopleFollow } from '~/constants/enum'
const enumValues = Object.values(PeopleFollow).filter((v) => typeof v === 'number') as number[]
export const SearchTweets = z.object({
  q: z.string().min(1, 'Query string is required'),
  page: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val > 0, { message: 'Page must be > 0' })
    .default('1'),

  limit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val > 0 && val <= 100, { message: 'Limit must be between 1 and 100' })
    .default('10'),
  type: z
    .enum(['tweets', 'people', 'media'], {
      required_error: 'Type is required',
      invalid_type_error: 'Type must be a string'
    })
    .default('tweets'),
  peopleFollow: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => enumValues.includes(val), { message: 'Invalid people follow' })
    .default(PeopleFollow.Anyone)
})
export type SearchTweetsType = z.infer<typeof SearchTweets>
