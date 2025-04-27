import { Router } from 'express'
import { bookmarkTweetController, unBookmarkTweetController } from '~/controllers/bookmarks.controllers'
import validate from '~/middlewares/validate.middleware'
import { isVerifiedUser } from '~/middlewares/verifyUser.middleware'
import { BookmarkTweetBody } from '~/schemaValidations/bookmarks.schema'

const bookmarksRouter = Router()

bookmarksRouter.post('/', isVerifiedUser, validate(BookmarkTweetBody), bookmarkTweetController)
bookmarksRouter.delete(
  '/tweet/:tweetId',
  isVerifiedUser,
  validate(BookmarkTweetBody, 'params'),
  unBookmarkTweetController
)

export default bookmarksRouter
