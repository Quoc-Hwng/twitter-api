import { NextFunction, Request, Response } from 'express'
import { environment } from '~/config/env.config'
import { HTTP_STATUS } from '~/config/http.config'
import { Authorization } from '~/constants/algorithms'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TweetBodyType, TweetRes, GetTweet, GetTweetRes, GetTweetChildren } from '~/schemaValidations/tweets.schema'
import tweetsService from '~/services/tweets.services'
import { AuthRequest } from '~/type'
import { verifyToken } from '~/utils/jwt'

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

export const getTweetController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = Authorization(req)
    const { userId } = await verifyToken({
      token,
      secretOrPublicKey: environment.ACCESS_TOKEN_SECRET_SIGNATURE
    })
    const currentUserId = userId || null
    const data = GetTweet.parse(req.params)
    await tweetsService.increaseView(data.tweetId)
    const result = await tweetsService.getTweetDetail(currentUserId, data.tweetId)
    const validatedResponse = GetTweetRes.parse({
      message: 'Get tweet successfully',
      data: result
    })
    res.status(HTTP_STATUS.CREATED).json(validatedResponse)
  } catch (error) {
    next(error)
  }
}
export const getTweetChildrenController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = Authorization(req)
    const { userId } = await verifyToken({
      token,
      secretOrPublicKey: environment.ACCESS_TOKEN_SECRET_SIGNATURE
    })
    const currentUserId = userId || null
    const tweet = GetTweet.parse(req.params)
    const pagination = GetTweetChildren.parse(req.query)
    await tweetsService.increaseView(tweet.tweetId)
    const result = await tweetsService.getTweetChildren(
      currentUserId,
      tweet.tweetId,
      pagination.tweetType,
      pagination.limit,
      pagination.page
    )
    // const validatedResponse = GetTweetRes.parse({
    //   message: 'Get tweet successfully',
    //   data: result
    // })
    res.status(HTTP_STATUS.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}
