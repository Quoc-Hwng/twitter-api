import databaseConfig from '~/config/database.config'
import User from '~/models/schemas/User.schema'
import { RegisterBodyType } from '../schemaValidations/users.schema'

class UsersService {
  async register(data: RegisterBodyType) {
    const { name, email, password, date_of_birth } = data
    const result = await databaseConfig.users.insertOne(
      new User({ name, email, password, date_of_birth: new Date(date_of_birth) })
    )
    return result
  }

  async findUserByEmail(email: string) {
    return databaseConfig.users.findOne({ email })
  }
}

const usersService = new UsersService()
export default usersService
