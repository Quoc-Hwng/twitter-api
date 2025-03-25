import { NextFunction, Request, Response } from 'express'
import databaseConfig from '~/config/database.config'
import { HTTP_STATUS } from '~/config/http.config'
import { USERS_MESSAGES } from '~/constants/mesages'
import User from '~/models/schemas/User.schema'
import { RegisterBodyType } from '~/schemaValidations/auth.schema'
import usersService from '~/services/users.services'
import { ValidationError } from '~/utils/errors'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email == 'haha' && password == 'haha') {
    res.status(HTTP_STATUS.OK).json({ message: 'Login successful' })
  } else {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Login failed' })
  }
}
export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: RegisterBodyType = req.body
    const existingUser = await usersService.findUserByEmail(data.email)
    if (existingUser) {
      throw new ValidationError('Validation failed', [{ path: 'email', message: 'Email already exists' }])
    }
    const result = await usersService.register(data)
    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      code: HTTP_STATUS.CREATED,
      data: result,
      message: 'Register success'
    })
  } catch (error) {
    next(error)
  }
}
