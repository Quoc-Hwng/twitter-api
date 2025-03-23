import express from 'express'
import { usersRouter } from './users.routes'

const Router = express.Router()
Router.use('/users', usersRouter)

export const APIs_V1 = Router
