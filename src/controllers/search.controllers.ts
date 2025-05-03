import { Response, NextFunction } from 'express'
import { HTTP_STATUS } from '~/config/http.config'
import { PeopleFollow } from '~/constants/enum'
import { SearchTweets } from '~/schemaValidations/search.schema'
import searchService from '~/services/search.services'
import { AuthRequest } from '~/type'

export async function searchController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { q, page, limit, type, peopleFollow } = SearchTweets.parse(req.query)
    const currentUserId = req.userId
    const handlers: Record<
      'tweets' | 'people' | 'media',
      (q: string, page: number, limit: number, userId: string, peopleFollow: PeopleFollow) => Promise<unknown>
    > = {
      tweets: searchService.searchTop,
      people: searchService.searchUsers,
      media: searchService.searchMedia
    }

    const result = await handlers[type](q, page, limit, currentUserId!, peopleFollow)
    res.status(HTTP_STATUS.OK).json(result)
  } catch (err) {
    next(err)
  }
}
