import { Router } from 'express'
import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import validate from '~/middlewares/validate.middleware'
import { LoginBody, LogoutBody, RegisterBody } from '~/schemaValidations/auth.schema'

export const usersRouter = Router()

usersRouter.post('/login', validate(LoginBody), loginController)
usersRouter.post('/register', validate(RegisterBody), registerController)
usersRouter.post('/logout', validate(LogoutBody), logoutController)
