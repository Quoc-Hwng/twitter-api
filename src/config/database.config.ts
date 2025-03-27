import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import { environment } from './env.config'
import { UserType } from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'

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

  get users(): Collection<UserType> {
    return this.db.collection(environment.DB_USERS_COLLECTION)
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(environment.DB_REFRESH_TOKEN_COLLECTION)
  }
}

const databaseConfig = new DatabaseConfig()
export default databaseConfig
