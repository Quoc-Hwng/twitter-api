import { Router } from 'express'
import {
  forgotPasswordController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  reSendVerifyEmailController,
  verifyEmailController
} from '~/controllers/users.controllers'
import validate from '~/middlewares/validate.middleware'
import {
  LoginBody,
  LogoutBody,
  PasswordResetTokenBody,
  RefreshTokenBody,
  RegisterBody,
  VerifyEmailBody
} from '~/schemaValidations/auth.schema'

export const usersRouter = Router()

usersRouter.post('/login', validate(LoginBody), loginController)
usersRouter.post('/register', validate(RegisterBody), registerController)
usersRouter.post('/logout', validate(LogoutBody), logoutController)
usersRouter.post('/refresh-token', validate(RefreshTokenBody), refreshTokenController)
usersRouter.post('/verify-email', validate(VerifyEmailBody), verifyEmailController)
usersRouter.post('/resend-verify-email', reSendVerifyEmailController)
usersRouter.post('/forgot-password', validate(PasswordResetTokenBody), forgotPasswordController)
