import { NextFunction, Request, Response } from 'express'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    next(
      res.status(400).json({
        error: 'Missing email or password'
      })
    )
  }
  next()
}
