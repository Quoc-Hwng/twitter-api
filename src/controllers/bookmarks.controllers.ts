import { NextFunction, Response } from 'express'
import { HTTP_STATUS } from '~/config/http.config'
import { BOOKMARK_MESSAGES } from '~/constants/messages'
import { BookmarkTweetBody, BookmarkTweetBodyType, BookmarkTweetRes } from '~/schemaValidations/bookmarks.schema'
import bookmarksService from '~/services/bookmarks.services'
import { AuthRequest } from '~/type'

export const bookmarkTweetController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId
    const { tweetId }: BookmarkTweetBodyType = req.body
    const result = await bookmarksService.bookmarkTweet(userId!, tweetId)
    const validatedResponse = BookmarkTweetRes.parse({
      message: BOOKMARK_MESSAGES.BOOKMARK_SUCCESSFULLY,
      data: result
    })
    res.status(HTTP_STATUS.CREATED).json(validatedResponse)
  } catch (error) {
    next(error)
  }
}

export const unBookmarkTweetController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId
    const data = BookmarkTweetBody.parse(req.params)
    const result = await bookmarksService.unBookmarkTweet(userId!, data.tweetId)
    res.status(HTTP_STATUS.OK).json(result)
  } catch (error) {
    next(error)
  }
}
