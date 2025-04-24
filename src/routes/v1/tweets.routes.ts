import { Router } from 'express'
import { createTweetController } from '~/controllers/tweets.controllers'
import validate from '~/middlewares/validate.middleware'
import { isVerifiedUser } from '~/middlewares/verifyUser.middleware'
import { TweetBody } from '~/schemaValidations/tweets.schema'

const tweetsRouter = Router()

tweetsRouter.post('/', isVerifiedUser, validate(TweetBody), createTweetController)

export default tweetsRouter
