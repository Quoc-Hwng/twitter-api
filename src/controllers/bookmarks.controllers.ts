import { NextFunction, Response } from 'express'
import { HTTP_STATUS } from '~/config/http.config'
import { BookmarkTweetBodyType, BookmarkTweetRes } from '~/schemaValidations/bookmarks.schema'
import bookmarksService from '~/services/bookmarks.services'
import { AuthRequest } from '~/type'

export const bookmarkTweetController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId
    const { tweetId }: BookmarkTweetBodyType = req.body
    const result = await bookmarksService.bookmarkTweet(userId!, tweetId)
    const validatedResponse = BookmarkTweetRes.parse({
      message: 'Bookmark tweet successfully',
      data: result
    })
    res.status(HTTP_STATUS.CREATED).json(validatedResponse)
  } catch (error) {
    next(error)
  }
}
