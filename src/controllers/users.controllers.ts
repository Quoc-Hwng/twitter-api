import { NextFunction, Request, Response } from 'express'
import databaseConfig from '~/config/database.config'
import { HTTP_STATUS } from '~/config/http.config'
import { USERS_MESSAGES } from '~/constants/mesages'
import User from '~/models/schemas/User.schema'
import { RegisterBodyType } from '~/schemaValidations/users.schema'
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
    console.log((data as any).nonExistentProperty.toString())
    const existingUser = await usersService.findUserByEmail(data.email)
    if (existingUser) {
      throw new ValidationError('Email already exists', { path: 'email' })
    }
    const result = await usersService.register(data)
    res.status(HTTP_STATUS.CREATED).json({ result, message: USERS_MESSAGES.REGISTER_SUCCESS })
  } catch (error) {
    next(error)
  }
}
