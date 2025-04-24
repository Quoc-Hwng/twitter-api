import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUS } from '~/config/http.config'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = await mediasService.uploadImage(req)
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.UPLOAD_SUCCESS,
      result: url
    })
  } catch (error) {
    next(error)
  }
}
export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = await mediasService.uploadVideo(req)
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.UPLOAD_SUCCESS,
      result: url
    })
  } catch (error) {
    next(error)
  }
}
