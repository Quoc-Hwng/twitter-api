import { Router } from 'express'
import { uploadImageController } from '~/controllers/medias.controller'

const mediasRouter = Router()

mediasRouter.post('/upload-image', uploadImageController)

export default mediasRouter
