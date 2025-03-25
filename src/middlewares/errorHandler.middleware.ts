import { ZodError } from 'zod'
import { Request, Response, NextFunction } from 'express'
import { HttpError } from '~/utils/errors'
import { USERS_MESSAGES } from '~/constants/mesages'

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const isProduction = process.env.NODE_ENV === 'production'

  let statusCode = 500
  let message = 'Internal Server Error'
  let errors: { path: string; message: string }[] = []

  if (err instanceof ZodError) {
    // Xử lý lỗi từ Zod
    statusCode = 400
    message = USERS_MESSAGES.VALIDATION_FAILED
    errors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message
    }))
  } else if (err instanceof HttpError) {
    // Xử lý lỗi HTTP custom
    statusCode = err.statusCode
    message = err.message
    errors = err.errors || []
  }

  if (!isProduction) {
    console.error('🔥 ERROR:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      errors
    })
  }

  res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message,
    ...(errors.length > 0 ? { errors } : {})
  })
}
