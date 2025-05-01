import { Router } from 'express'
import { createTweetController, getTweetChildrenController, getTweetController } from '~/controllers/tweets.controllers'
import validate from '~/middlewares/validate.middleware'
import { isVerifiedUser } from '~/middlewares/verifyUser.middleware'
import { GetTweet, GetTweetChildren, TweetBody } from '~/schemaValidations/tweets.schema'

const tweetsRouter = Router()

tweetsRouter.post('/', isVerifiedUser, validate(TweetBody), createTweetController)
tweetsRouter.get('/:tweetId', validate(GetTweet, 'params'), getTweetController)
tweetsRouter.get(
  '/:tweetId/children',
  validate(GetTweet, 'params'),
  validate(GetTweetChildren, 'query'),
  getTweetChildrenController
)

export default tweetsRouter
