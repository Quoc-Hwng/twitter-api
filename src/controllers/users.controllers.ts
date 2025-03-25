import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUS } from '~/config/http.config'
import { LoginBodyType, LoginRes, RegisterBodyType, registerResponseSchema } from '~/schemaValidations/auth.schema'
import usersService from '~/services/users.services'
import { ValidationError } from '~/utils/errors'

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: LoginBodyType = req.body
    const result = await usersService.login(data)
    const validatedResponse = LoginRes.parse({
      message: 'Login success',
      data: result
    })
    res.status(HTTP_STATUS.OK).json(validatedResponse)
  } catch (error) {
    next(error)
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
    const validatedResponse = registerResponseSchema.parse({
      message: 'Register success',
      data: result
    })
    res.status(HTTP_STATUS.CREATED).json(validatedResponse)
  } catch (error) {
    next(error)
  }
}
