import express from 'express'
import { usersRouter } from './users.routes'
import mediasRouter from './medias.routes'

const Router = express.Router()
Router.use('/users', usersRouter)
Router.use('/medias', mediasRouter)

export const APIs_V1 = Router
