import { NextFunction, Request, Response } from 'express'
import { HTTP_STATUS } from '~/config/http.config'
import { Authorization } from '~/constants/algorithms'
import { USERS_MESSAGES } from '~/constants/messages'
import {
  FollowBodyType,
  FollowRes,
  GetMeRes,
  GetProfileParam,
  GetProfileRes,
  LoginBodyType,
  LoginRes,
  LogoutBodyType,
  PasswordResetBodyType,
  PasswordResetTokenBodyType,
  RefreshTokenBodyType,
  RefreshTokenRes,
  RegisterBodyType,
  RegisterRes,
  ReSendVerifyEmailRes,
  UpdateMeBodyType,
  UpdateMeRes,
  VerifyEmailBodyType,
  VerifyEmailRes,
  VerifyPasswordResetBodyType,
  VerifyPasswordResetRes
} from '~/schemaValidations/users.schema'
import { AuthRequest } from '~/type'
import usersService from '~/services/users.services'

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
    Authorization(req)
    const data: LogoutBodyType = req.body
    await usersService.logout(data.refreshToken)
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    })
  } catch (error) {
    next(error)
  }
}
export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken }: RefreshTokenBodyType = req.body
    const result = await usersService.refreshToken({ refreshToken })
    const validatedResponse = RefreshTokenRes.parse({
      message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
      data: result
    })
    res.status(HTTP_STATUS.OK).json(validatedResponse)
  } catch (error) {
    next(error)
  }
}

export const verifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: VerifyEmailBodyType = req.body
    const result = await usersService.verifyEmail(data.verifyToken)
    const validatedResponse = VerifyEmailRes.parse({
      message: result
    })
    res.status(HTTP_STATUS.OK).json(validatedResponse)
  } catch (error) {
    next(error)
  }
}
export const reSendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = Authorization(req)
    const result = await usersService.reSendVerifyEmail(accessToken)
    const validatedResponse = ReSendVerifyEmailRes.parse({
      message: result
    })
    res.status(HTTP_STATUS.OK).json(validatedResponse)
  } catch (error) {
    next(error)
  }
}

export const forgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: PasswordResetTokenBodyType = req.body
    const result = await usersService.forgotPassword(data.email)
    const validatedResponse = ReSendVerifyEmailRes.parse({
      message: result
    })
    res.status(200).json(validatedResponse)
  } catch (error) {
    next(error)
  }
}

export const verifyForgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: VerifyPasswordResetBodyType = req.body
    const result = await usersService.verifyForgotPassword(data.verifyToken)
    const validatedResponse = VerifyPasswordResetRes.parse({
      message: result
    })
    res.status(200).json(validatedResponse)
  } catch (error) {
    next(error)
  }
}

export const passwordResetController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: PasswordResetBodyType = req.body
    const result = await usersService.passwordReset(data)
    const validatedResponse = VerifyPasswordResetRes.parse({
      message: result
    })
    res.status(200).json(validatedResponse)
  } catch (error) {
    next(error)
  }
}
export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = Authorization(req)
    const result = await usersService.getMe(accessToken)
    const validatedResponse = GetMeRes.parse({
      message: USERS_MESSAGES.GET_ME_SUCCESS,
      data: result
    })
    res.status(200).json(validatedResponse)
  } catch (error) {
    next(error)
  }
}

export const updateMeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = Authorization(req)
    const data: UpdateMeBodyType = req.body
    const result = await usersService.updateMe(accessToken, data)
    const validatedResponse = UpdateMeRes.parse({
      message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
      data: result
    })
    res.status(200).json(validatedResponse)
  } catch (error) {
    next(error)
  }
}

export const getProfileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = GetProfileParam.parse(req.params)
    const user = await usersService.getProfile(data.username)
    const validatedResponse = GetProfileRes.parse({
      message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
      data: user
    })
    res.status(200).json(validatedResponse)
  } catch (error) {
    next(error)
  }
}

export const followController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId
    const data: FollowBodyType = req.body
    const result = await usersService.followUser(data.targetUserId, userId!)
    const validatedResponse = FollowRes.parse({
      message: USERS_MESSAGES.FOLLOW_SUCCESS,
      followStatus: result
    })
    res.json(validatedResponse)
  } catch (error) {
    next(error)
  }
}
