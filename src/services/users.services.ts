import databaseConfig from '~/config/database.config'
import User from '~/models/schemas/User.schema'
import { LoginBodyType, RegisterBodyType } from '../schemaValidations/auth.schema'
import { compareValue, hashValue } from '~/utils/bcrypt'
import { getExpiresIn, signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enum'
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

  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  async register(data: RegisterBodyType) {
    const hashedPassword = await hashValue(data.password)
    const result = await databaseConfig.users.insertOne(
      new User({ ...data, password: hashedPassword, date_of_birth: new Date(data.date_of_birth) })
    )
    const user_id = result.insertedId.toString()
    const user = await this.findUserById(user_id).then((user) => {
      return {
        ...user,
        date_of_birth: user?.date_of_birth.toISOString()
      }
    })
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(user_id)
    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id?.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        date_of_birth: user.date_of_birth
      }
    }
  }

  async findUserByEmail(email: string) {
    return databaseConfig.users.findOne({ email })
  }

  async findUserById(user_id: string) {
    return databaseConfig.users.findOne({ _id: new ObjectId(user_id) })
  }

  async login(data: LoginBodyType) {
    const user = await this.findUserByEmail(data.email)
    if (!user) {
      throw new Error('Invalid email or password')
    }

    const isMatchPassword = await compareValue(data.password, user.password)
    if (!isMatchPassword) {
      throw new Error('Invalid email or password')
    }
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(user._id.toString())
    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        date_of_birth: user.date_of_birth.toISOString()
      }
    }
  }
}

const usersService = new UsersService()
export default usersService
