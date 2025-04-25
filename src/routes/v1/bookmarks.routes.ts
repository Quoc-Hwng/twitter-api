import { Router } from 'express'
import { bookmarkTweetController } from '~/controllers/bookmarks.controllers'
import validate from '~/middlewares/validate.middleware'
import { isVerifiedUser } from '~/middlewares/verifyUser.middleware'
import { BookmarkTweetBody } from '~/schemaValidations/bookmarks.schema'

const bookmarksRouter = Router()

bookmarksRouter.post('/', isVerifiedUser, validate(BookmarkTweetBody), bookmarkTweetController)

export default bookmarksRouter
