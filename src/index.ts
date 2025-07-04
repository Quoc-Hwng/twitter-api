import express from 'express'
import databaseConfig from './config/database.config'
import { environment } from './config/env.config'
import { APIs_V1 } from './routes/v1'
import { errorHandler } from './middlewares/errorHandler.middleware'

const app = express()

databaseConfig.connect().then(() => {
  databaseConfig.indexUsers()
  databaseConfig.indexRefreshToken()
  databaseConfig.indexFollowers()
  databaseConfig.indexTweets()
})

app.use(express.json())
app.use('/v1', APIs_V1)
app.use(errorHandler)
app.listen(environment.APP_PORT, () => {
  console.log(`Example app listening on port ${environment.APP_PORT}`)
})
