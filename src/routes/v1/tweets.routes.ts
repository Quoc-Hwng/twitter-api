import { Router } from 'express'
import { createTweetController, getTweetController } from '~/controllers/tweets.controllers'
import validate from '~/middlewares/validate.middleware'
import { isVerifiedUser } from '~/middlewares/verifyUser.middleware'
import { GetTweet, TweetBody } from '~/schemaValidations/tweets.schema'

const tweetsRouter = Router()

tweetsRouter.post('/', isVerifiedUser, validate(TweetBody), createTweetController)
tweetsRouter.get('/:tweetId', validate(GetTweet, 'params'), getTweetController)

export default tweetsRouter
