import { NextFunction, Request, Response } from 'express'
import { environment } from '~/config/env.config'
import { HTTP_STATUS } from '~/config/http.config'
import { USERS_MESSAGES } from '~/constants/mesages'
import { LoginBodyType, LoginRes, RegisterBodyType, RegisterRes } from '~/schemaValidations/auth.schema'
import usersService from '~/services/users.services'
import { UnauthorizedError, ValidationError } from '~/utils/errors'
import { verifyToken } from '~/utils/jwt'

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: LoginBodyType = req.body
    const result = await usersService.login(data)
    const validatedResponse = LoginRes.parse({
      message: USERS_MESSAGES.LOGIN_SUCCESS,
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
      throw new ValidationError(USERS_MESSAGES.VALIDATION_FAILED, [
        { path: 'email', message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS }
      ])
    }
    const result = await usersService.register(data)
    const validatedResponse = RegisterRes.parse({
      message: USERS_MESSAGES.REGISTER_SUCCESS,
      data: result
    })
    res.status(HTTP_STATUS.CREATED).json(validatedResponse)
  } catch (error) {
    next(error)
  }
}

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Unauthorized: No token provided')
    }

    const accessToken = req.headers.authorization?.split(' ')[1]
    if (!accessToken) {
      throw new ValidationError(USERS_MESSAGES.VALIDATION_FAILED, [
        { path: 'accessToken', message: 'Access token is required' }
      ])
    }
    const decoded = verifyToken({ token: accessToken, secretOrPublicKey: environment.ACCESS_TOKEN_SECRET_SIGNATURE })
    if (!decoded) {
      throw new UnauthorizedError('Unauthorized: Invalid token')
    }
    const { refreshToken } = req.body
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required')
    }
    await usersService.logout(refreshToken)
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    })
  } catch (error) {
    next(error)
  }
}
