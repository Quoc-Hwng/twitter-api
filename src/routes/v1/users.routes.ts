import { Router } from 'express'
import {
  changePasswordController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  passwordResetController,
  refreshTokenController,
  registerController,
  reSendVerifyEmailController,
  unFollowController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import validate from '~/middlewares/validate.middleware'
import { isVerifiedUser } from '~/middlewares/verifyUser.middleware'
import {
  ChangePasswordBody,
  FollowBody,
  GetProfileParam,
  LoginBody,
  LogoutBody,
  PasswordResetBody,
  PasswordResetTokenBody,
  RefreshTokenBody,
  RegisterBody,
  UpdateMeBody,
  VerifyEmailBody,
  VerifyPasswordResetBody
} from '~/schemaValidations/users.schema'

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
usersRouter.get('/:username', validate(GetProfileParam, 'params'), getProfileController)
usersRouter.post('/follow', validate(FollowBody), isVerifiedUser, followController)
usersRouter.delete('/follow/:targetUserId', validate(FollowBody, 'params'), isVerifiedUser, unFollowController)
usersRouter.put('/change-password', validate(ChangePasswordBody), isVerifiedUser, changePasswordController)
