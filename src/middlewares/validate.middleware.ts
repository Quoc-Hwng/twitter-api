import { Request, Response, NextFunction } from 'express'
import { ZodType, ZodError } from 'zod'
import { HTTP_STATUS } from '~/config/http.config'
import { USERS_MESSAGES } from '~/constants/messages'

const validate =
  <T>(schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body) as T
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message
        }))

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: 'error',
          code: HTTP_STATUS.BAD_REQUEST,
          message: USERS_MESSAGES.VALIDATION_FAILED,
          errors
        })
      }
      next(error)
    }
  }

export default validate
