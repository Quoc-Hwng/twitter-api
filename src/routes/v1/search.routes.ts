import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'
import validate from '~/middlewares/validate.middleware'
import { isVerifiedUser } from '~/middlewares/verifyUser.middleware'
import { SearchTweets } from '~/schemaValidations/search.schema'

const searchRouter = Router()

searchRouter.get('/', isVerifiedUser, searchController)

export default searchRouter
