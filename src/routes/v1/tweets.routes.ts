import { Router } from 'express'
import {
  createTweetController,
  getListTweetsController,
  getListTweetsTimeLineController,
  getTweetChildrenController,
  getTweetController
} from '~/controllers/tweets.controllers'
import validate from '~/middlewares/validate.middleware'
import { isVerifiedUser } from '~/middlewares/verifyUser.middleware'
import { getListTweets, GetTweet, GetTweetChildren, TweetBody } from '~/schemaValidations/tweets.schema'

const tweetsRouter = Router()

tweetsRouter.post('/', isVerifiedUser, validate(TweetBody), createTweetController)
tweetsRouter.get('/timeline', isVerifiedUser, validate(getListTweets, 'query'), getListTweetsTimeLineController)
tweetsRouter.get('/:tweetId', validate(GetTweet, 'params'), getTweetController)
tweetsRouter.get(
  '/:tweetId/children',
  validate(GetTweet, 'params'),
  validate(GetTweetChildren, 'query'),
  getTweetChildrenController
)
tweetsRouter.get('/', validate(getListTweets, 'query'), getListTweetsController)

export default tweetsRouter
