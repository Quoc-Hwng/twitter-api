import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUS } from '~/config/http.config'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TweetBodyType, TweetRes } from '~/schemaValidations/tweets.schema'
import tweetsService from '~/services/tweets.services'
import { AuthRequest } from '~/type'

export const createTweetController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId
    const data: TweetBodyType = req.body
    const result = await tweetsService.createTweetService(data, userId!)
    const validatedResponse = TweetRes.parse({
      message: 'Create tweet successfully',
      data: result
    })
    res.status(HTTP_STATUS.CREATED).json(validatedResponse)
  } catch (error) {
    next(error)
  }
}
