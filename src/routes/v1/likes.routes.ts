import { Router } from 'express'
import { likeTweetController, unLikeTweetController } from '~/controllers/likes.controllers'
import validate from '~/middlewares/validate.middleware'
import { isVerifiedUser } from '~/middlewares/verifyUser.middleware'
import { LikeTweetBody } from '~/schemaValidations/likes.schema'

const likesRouter = Router()

likesRouter.post('/', isVerifiedUser, validate(LikeTweetBody), likeTweetController)
likesRouter.delete('/tweet/:tweetId', isVerifiedUser, validate(LikeTweetBody, 'params'), unLikeTweetController)

export default likesRouter
