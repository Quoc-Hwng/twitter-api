import { Router } from 'express'
import { createTweetController } from '~/controllers/tweets.controllers'
import validate from '~/middlewares/validate.middleware'
import { isVerifiedUser } from '~/middlewares/verifyUser.middleware'
import { TweetBody } from '~/schemaValidations/tweets.schema'

const likesRouter = Router()

likesRouter.post('/', isVerifiedUser, validate(TweetBody), createTweetController)

export default likesRouter
