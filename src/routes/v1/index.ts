import express from 'express'
import { usersRouter } from './users.routes'
import mediasRouter from './medias.routes'
import tweetsRouter from './tweets.routes'

const Router = express.Router()
Router.use('/users', usersRouter)
Router.use('/medias', mediasRouter)
Router.use('/tweets', tweetsRouter)

export const APIs_V1 = Router
