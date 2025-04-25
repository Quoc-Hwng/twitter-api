import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import { environment } from './env.config'
import { UserType } from '~/models/schemas/User.schema'
import { RefreshTokenType } from '~/models/schemas/RefreshToken.schema'
import { FollowerType } from '~/models/schemas/Follower.schema'
import { Tweet } from '~/models/schemas/Tweet.schema'
import { HashtagType } from '~/models/schemas/Hashtag.schema'

const uri = environment.MONGODB_URI

class DatabaseConfig {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })
    this.db = this.client.db(environment.DATABASE_NAME)
  }
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

  indexUsers() {
    this.users.createIndex({ email: 1, password: 1 })
    this.users.createIndex({ email: 1 }, { unique: true })
    this.users.createIndex({ username: 1 }, { unique: true })
  }

  indexRefreshToken() {
    this.refreshTokens.createIndex({ token: 1 })
    this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
  }

  async indexTweets() {
    const exists = await this.tweets.indexExists(['content_text'])
    if (!exists) {
      this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
    }
  }

  get users(): Collection<UserType> {
    return this.db.collection(environment.DB_USERS_COLLECTION)
  }
  get refreshTokens(): Collection<RefreshTokenType> {
    return this.db.collection(environment.DB_REFRESH_TOKEN_COLLECTION)
  }
  get followers(): Collection<FollowerType> {
    return this.db.collection(environment.DB_FOLLOWERS_COLLECTION)
  }
  get tweets(): Collection<Tweet> {
    return this.db.collection(environment.DB_TWEETS_COLLECTION)
  }
  get hashtags(): Collection<HashtagType> {
    return this.db.collection(environment.DB_HASHTAGS_COLLECTION)
  }
}

const databaseConfig = new DatabaseConfig()
export default databaseConfig
