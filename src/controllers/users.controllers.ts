import { Request, Response } from 'express'
import databaseConfig from '~/config/database.config'
import User from '~/models/schemas/User.schema'
import { RegisterBodyType } from '~/schemaValidations/users.schema'
import usersService from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email == 'haha' && password == 'haha') {
    res.status(200).json({ message: 'Login successful' })
  } else {
    res.status(400).json({ message: 'Login failed' })
  }
}
export const registerController = async (req: Request, res: Response) => {
  const data: RegisterBodyType = req.body
  try {
    const existingUser = await usersService.findUserByEmail(data.email)
    if (existingUser) {
      res.status(400).json({
        errors: [{ path: 'email', message: 'Email already exists' }]
      })
    }
    const result = await usersService.register(data)
    res.status(201).json({ result, message: 'Register success' })
  } catch (error) {
    res.status(400).json({ message: 'Register failed', error })
  }
}
