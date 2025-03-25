import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import validate from '~/middlewares/validate.middleware'
import { loginSchema, registerSchema } from '~/schemaValidations/auth.schema'

export const usersRouter = Router()

usersRouter.post('/login', validate(loginSchema), loginController)
usersRouter.post('/register', validate(registerSchema), registerController)
