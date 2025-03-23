import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import { environment } from './env.config'
import User from '~/models/schemas/User.schema'

const uri = environment.MONGODB_URI

class DatabaseConfig {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(environment.DATABASE_NAME)
  }
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } finally {
      // Ensures that the client will close when you finish/error
      await this.client.close()
    }
  }

  get users(): Collection<User> {
    return this.db.collection('users')
  }
}

const databaseConfig = new DatabaseConfig()
export default databaseConfig
