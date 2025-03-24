import databaseConfig from '~/config/database.config'
import User from '~/models/schemas/User.schema'
import { RegisterBodyType } from '../schemaValidations/users.schema'
import { hashValue } from '~/utils/bcrypt'
import { getExpiresIn, signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { environment } from '~/config/env.config'
import { ObjectId } from 'mongodb'

class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      privateKey: environment.ACCESS_TOKEN_SECRET_SIGNATURE,
      options: {
        expiresIn: getExpiresIn(environment.ACCESS_TOKEN_LIFE)
      }
    })
  }
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      privateKey: environment.REFRESH_TOKEN_SECRET_SIGNATURE,
      options: {
        expiresIn: getExpiresIn(environment.REFRESH_TOKEN_LIFE)
      }
    })
  }

  async register(data: RegisterBodyType) {
    const hashedPassword = await hashValue(data.password)
    const result = await databaseConfig.users.insertOne(
      new User({ ...data, password: hashedPassword, date_of_birth: new Date(data.date_of_birth) })
    )
    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    return {
      access_token,
      refresh_token
    }
  }

  async findUserByEmail(email: string) {
    return databaseConfig.users.findOne({ email })
  }
}

const usersService = new UsersService()
export default usersService
