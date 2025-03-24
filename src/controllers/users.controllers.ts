import { Request, Response } from 'express'
import databaseConfig from '~/config/database.config'
import { HTTP_STATUS } from '~/config/http.config'
import User from '~/models/schemas/User.schema'
import { RegisterBodyType } from '~/schemaValidations/users.schema'
import usersService from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email == 'haha' && password == 'haha') {
    res.status(HTTP_STATUS.OK).json({ message: 'Login successful' })
  } else {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Login failed' })
  }
}
export const registerController = async (req: Request, res: Response) => {
  const data: RegisterBodyType = req.body
  try {
    const existingUser = await usersService.findUserByEmail(data.email)
    if (existingUser) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        errors: [{ path: 'email', message: 'Email already exists' }]
      })
      return
    }
    const result = await usersService.register(data)
    res.status(HTTP_STATUS.CREATED).json({ result, message: 'Register success' })
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Register failed', error })
  }
}
