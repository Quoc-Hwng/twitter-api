import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import validate from '~/middlewares/validate.middleware'
import { registerSchema } from '~/schemaValidations/auth.schema'
// import { loginValidator } from '~/schemaValidations/users.schema'

export const usersRouter = Router()

// usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/register', validate(registerSchema), registerController)
