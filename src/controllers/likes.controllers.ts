import { NextFunction, Response } from 'express'
import { HTTP_STATUS } from '~/config/http.config'
import { BOOKMARK_MESSAGES, LIKE_MESSAGES } from '~/constants/messages'
import { BookmarkTweetBody, BookmarkTweetBodyType, BookmarkTweetRes } from '~/schemaValidations/bookmarks.schema'
import { LikeTweetBody, LikeTweetBodyType } from '~/schemaValidations/likes.schema'
import bookmarksService from '~/services/bookmarks.services'
import likesService from '~/services/likes.services'
import { AuthRequest } from '~/type'

export const likeTweetController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId
    const { tweetId }: LikeTweetBodyType = req.body
    const result = await likesService.LikeTweet(userId!, tweetId)
    const validatedResponse = BookmarkTweetRes.parse({
      message: LIKE_MESSAGES.LIKE_SUCCESSFULLY,
      data: result
    })
    res.status(HTTP_STATUS.OK).json(validatedResponse)
  } catch (error) {
    next(error)
  }
}

export const unLikeTweetController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId
    const data = LikeTweetBody.parse(req.params)
    const result = await likesService.unLikeTweet(userId!, data.tweetId)
    res.status(HTTP_STATUS.OK).json(result)
  } catch (error) {
    next(error)
  }
}
