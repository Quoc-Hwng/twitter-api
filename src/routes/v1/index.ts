import express from 'express'
import { usersRouter } from './users.routes'
import mediasRouter from './medias.routes'
import tweetsRouter from './tweets.routes'
import bookmarksRouter from './bookmarks.routes'
import likesRouter from './likes.routes'
import searchRouter from './search.routes'

const Router = express.Router()
Router.use('/users', usersRouter)
Router.use('/medias', mediasRouter)
Router.use('/tweets', tweetsRouter)
Router.use('/bookmarks', bookmarksRouter)
Router.use('/likes', likesRouter)
Router.use('/search', searchRouter)

export const APIs_V1 = Router
