import { Router } from 'express'
import {
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  passwordResetController,
  refreshTokenController,
  registerController,
  reSendVerifyEmailController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import validate from '~/middlewares/validate.middleware'
import { isVerifiedUser } from '~/middlewares/verifyUser.middleware'
import {
  LoginBody,
  LogoutBody,
  PasswordResetBody,
  PasswordResetTokenBody,
  RefreshTokenBody,
  RegisterBody,
  UpdateMeBody,
  VerifyEmailBody,
  VerifyPasswordResetBody
} from '~/schemaValidations/auth.schema'

export const usersRouter = Router()

usersRouter.post('/login', validate(LoginBody), loginController)
usersRouter.post('/register', validate(RegisterBody), registerController)
usersRouter.post('/logout', validate(LogoutBody), logoutController)
usersRouter.post('/refresh-token', validate(RefreshTokenBody), refreshTokenController)
usersRouter.post('/verify-email', validate(VerifyEmailBody), verifyEmailController)
usersRouter.post('/resend-verify-email', reSendVerifyEmailController)
usersRouter.post('/forgot-password', validate(PasswordResetTokenBody), forgotPasswordController)
usersRouter.post('/verify-forgot-password', validate(VerifyPasswordResetBody), verifyForgotPasswordController)
usersRouter.post('/password-reset', validate(PasswordResetBody), passwordResetController)
usersRouter.get('/me', getMeController)
usersRouter.patch('/me', validate(UpdateMeBody), isVerifiedUser, updateMeController)
