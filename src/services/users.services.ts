import databaseConfig from '~/config/database.config'
import User from '~/models/schemas/User.schema'
import { LoginBodyType, RegisterBodyType } from '../schemaValidations/auth.schema'
import { compareValue, hashValue } from '~/utils/bcrypt'
import { getExpiresIn, signToken, verifyToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enum'
import { environment } from '~/config/env.config'
import { ObjectId } from 'mongodb'
import { ValidationError } from '~/utils/errors'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { USERS_MESSAGES } from '~/constants/mesages'

class UsersService {
  private signAccessToken({ userId }: { userId: string }) {
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
  private signRefreshToken({ userId, exp }: { userId: string; exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          userId,
          token_type: TokenType.RefreshToken,

          exp
        },
        privateKey: environment.REFRESH_TOKEN_SECRET_SIGNATURE
      })
    }
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

  private signAccessAndRefreshToken({ userId }: { userId: string }) {
    return Promise.all([this.signAccessToken({ userId }), this.signRefreshToken({ userId })])
  }
  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: environment.REFRESH_TOKEN_SECRET_SIGNATURE
    })
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
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      userId
    })
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    await databaseConfig.refreshTokens.insertOne(
      new RefreshToken({ userId: new ObjectId(userId), token: refreshToken, iat, exp })
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
    //Validate email, password
    const user = await this.findUserByEmail(data.email)
    if (!user) {
      throw new ValidationError(USERS_MESSAGES.VALIDATION_FAILED, [
        { path: 'email', message: USERS_MESSAGES.INVALID_EMAIL_OR_PASSWORD }
      ])
    }
    const isMatchPassword = await compareValue(data.password, user.password)
    if (!isMatchPassword) {
      throw new ValidationError(USERS_MESSAGES.VALIDATION_FAILED, [
        { path: 'password', message: USERS_MESSAGES.INVALID_EMAIL_OR_PASSWORD }
      ])
    }

    //Logic login
    const userId = user._id.toString()
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      userId
    })
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    await databaseConfig.refreshTokens.insertOne(new RefreshToken({ userId: user._id, token: refreshToken, iat, exp }))
    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        date_of_birth: user.date_of_birth.toISOString()
      }
    }
  }
  async refreshToken({ refreshToken }: { refreshToken: string }) {
    const { userId } = await this.decodeRefreshToken(refreshToken)
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.signAccessToken({
        userId
      }),
      this.signRefreshToken({
        userId
      }),
      databaseConfig.refreshTokens.deleteOne({ token: refreshToken })
    ])
    const { iat, exp } = await this.decodeRefreshToken(newRefreshToken)
    await databaseConfig.refreshTokens.insertOne(
      new RefreshToken({ userId: new ObjectId(userId), token: newRefreshToken, iat, exp })
    )
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  }
  async logout(refreshToken: string) {
    const result = await databaseConfig.refreshTokens.deleteOne({ token: refreshToken })

    if (result.deletedCount === 0) {
      throw new ValidationError(USERS_MESSAGES.VALIDATION_FAILED, [
        { path: 'Refresh Token', message: 'Invalid refresh token' }
      ])
    }
  }
}

const usersService = new UsersService()
export default usersService
