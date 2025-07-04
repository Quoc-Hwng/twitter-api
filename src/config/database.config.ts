import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import { environment } from './env.config'
import { UserType } from '~/models/schemas/User.schema'
import { RefreshTokenType } from '~/models/schemas/RefreshToken.schema'
import { FollowerType } from '~/models/schemas/Follower.schema'
import { Tweet } from '~/models/schemas/Tweet.schema'
import { HashtagType } from '~/models/schemas/Hashtag.schema'
import { BookmarkType } from '~/models/schemas/Bookmark.schema'
import { LikeType } from '~/models/schemas/Like.schema'

const uri = environment.MONGODB_URI

class DatabaseConfig {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
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
  async indexUsers() {
    const exists = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])

    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }
  async indexRefreshToken() {
    const exists = await this.refreshTokens.indexExists(['exp_1', 'token_1'])

    if (!exists) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0
        }
      )
    }
  }

  async indexFollowers() {
    const exists = await this.followers.indexExists(['user_id_1_followed_user_id_1'])
    if (!exists) {
      this.followers.createIndex({ userId: 1, followedId: 1 })
    }
  }
  async indexTweets() {
    const exists = await this.tweets.indexExists(['content_text'])
    if (!exists) {
      this.tweets.createIndex({ content: 'text' }, { name: 'TweetTextIndex', default_language: 'none' })
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
  get bookmarks(): Collection<BookmarkType> {
    return this.db.collection(environment.DB_BOOKMARKS_COLLECTION)
  }
  get likes(): Collection<LikeType> {
    return this.db.collection(environment.DB_LIKES_COLLECTION)
  }
}

const databaseConfig = new DatabaseConfig()
export default databaseConfig
