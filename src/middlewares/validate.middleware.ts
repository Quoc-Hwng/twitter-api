import { Request, Response, NextFunction } from 'express'
import { ZodType } from 'zod'

const validate =
  <T>(schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body) as T
      next()
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          errors: JSON.parse(error.message)
        })
      }
      next(error)
    }
  }

export default validate
