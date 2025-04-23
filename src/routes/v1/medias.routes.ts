import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controller'
import { isVerifiedUser } from '~/middlewares/verifyUser.middleware'

const mediasRouter = Router()

mediasRouter.post('/upload-image', isVerifiedUser, uploadImageController)
mediasRouter.post('/upload-video', isVerifiedUser, uploadVideoController)

export default mediasRouter
