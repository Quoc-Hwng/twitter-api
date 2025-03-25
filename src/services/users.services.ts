import databaseConfig from '~/config/database.config'
import User from '~/models/schemas/User.schema'
import { LoginBodyType, RegisterBodyType } from '../schemaValidations/auth.schema'
import { compareValue, hashValue } from '~/utils/bcrypt'
import { getExpiresIn, signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enum'
import { environment } from '~/config/env.config'
import { ObjectId } from 'mongodb'
import { ValidationError } from '~/utils/errors'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { USERS_MESSAGES } from '~/constants/mesages'

class UsersService {
  private signAccessToken(userId: string) {
    return signToken({
      payload: {
        userId,
        token_type: TokenType.AccessToken
      },
      privateKey: environment.ACCESS_TOKEN_SECRET_SIGNATURE,
      options: {
        expiresIn: getExpiresIn(environment.ACCESS_TOKEN_LIFE)
      }
    })
  }
  private signRefreshToken(userId: string) {
    return signToken({
      payload: {
        userId,
        token_type: TokenType.RefreshToken
      },
      privateKey: environment.REFRESH_TOKEN_SECRET_SIGNATURE,
      options: {
        expiresIn: getExpiresIn(environment.REFRESH_TOKEN_LIFE)
      }
    })
  }

  private signAccessAndRefreshToken(userId: string) {
    return Promise.all([this.signAccessToken(userId), this.signRefreshToken(userId)])
  }

  async register(data: RegisterBodyType) {
    const hashedPassword = await hashValue(data.password)
    const result = await databaseConfig.users.insertOne(
      new User({ ...data, password: hashedPassword, date_of_birth: new Date(data.date_of_birth) })
    )
    const userId = result.insertedId.toString()
    const user = await this.findUserById(userId).then((user) => {
      return {
        ...user,
        date_of_birth: user?.date_of_birth.toISOString()
      }
    })
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(userId)
    await databaseConfig.refreshTokens.insertOne(
      new RefreshToken({ userId: new ObjectId(userId), token: refreshToken })
    )
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

  async findUserById(userId: string) {
    return databaseConfig.users.findOne({ _id: new ObjectId(userId) })
  }

  async login(data: LoginBodyType) {
    const user = await this.findUserByEmail(data.email)
    if (!user) {
      throw new ValidationError(USERS_MESSAGES.VALIDATION_FAILED, [
        { path: 'email', message: USERS_MESSAGES.INVALID_EMAIL_OR_PASSWORD }
      ])
      // throw new Error('Invalid email or password')
    }

    const isMatchPassword = await compareValue(data.password, user.password)
    if (!isMatchPassword) {
      throw new ValidationError(USERS_MESSAGES.VALIDATION_FAILED, [
        { path: 'password', message: USERS_MESSAGES.INVALID_EMAIL_OR_PASSWORD }
      ])
    }
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(user._id.toString())
    await databaseConfig.refreshTokens.insertOne(new RefreshToken({ userId: user._id, token: refreshToken }))
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
