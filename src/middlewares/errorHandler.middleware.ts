import { Request, Response, NextFunction } from 'express'
import { HttpError } from '~/utils/errors'

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const isProduction = process.env.NODE_ENV === 'production'

  let statusCode = 500
  let message = 'Internal Server Error'
  let data: Record<string, unknown> | null = null

  if (err instanceof HttpError) {
    statusCode = err.statusCode
    message = err.message
    data = err.data || null
  }

  if (!isProduction) {
    console.error('🔥 ERROR:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      data
    })
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(data && { data })
  })
}
