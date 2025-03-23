import { Request, Response } from 'express'
import databaseConfig from '~/config/database.config'
import User from '~/models/schemas/User.schema'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email == 'haha' && password == 'haha') {
    res.status(200).json({ message: 'Login successful' })
  } else {
    res.status(400).json({ message: 'Login failed' })
  }
}
export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const result = await databaseConfig.users.insertOne(new User({ email, password }))
    res.status(200).json({ result, message: 'Login success' })
  } catch (error) {
    console.log(error)
  }
}
